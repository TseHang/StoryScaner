var fs = require("fs");
var path = require("path");
var express = require("express");
var https = require("https");
var bodyParser = require("body-parser");
var session = require("express-session");
var mongo = require("mongodb").MongoClient;
var ObjectID = require("mongodb").ObjectID;
var hash = require("password-hash");
var cors = require("cors");

var DB_URL = "mongodb://localhost:27017/groupC";
var POI = {
    1: {
        1: [],
        2: [],
        3: [],
        4: [],
        5: []
    },
    2: {
        6: [],
        7: [],
        8: [],
        9: [],
        10: []
    },
    3: {
        11: [],
        12: [],
        13: [],
        14: [],
        15: []
    }
};
var SSL = {
    key: fs.readFileSync("auth/key.pem"),
    cert: fs.readFileSync("auth/certificate.pem")
};

var app = new express();
var dbGroupC;

var log = fs.createWriteStream("err.log");

process.stdout.write = process.stderr.write = log.write.bind(log);

app.use("/upload_images", express.static(path.join(__dirname, "public/upload_images")));
app.use(cors());
app.use("/", express.static(path.join(__dirname, "public")));
app.use(["/signup", "/signin", "/story", "/position", "/route", "/edit"], bodyParser.json());
app.use(session({
    secret: "story-scaner",
    resave: false,
    saveUninitialized: false
}));

mongo.connect(DB_URL, function (err, db) {
    if (err) {
        throw err;
    }

    var auth = JSON.parse(fs.readFileSync("auth/auth.json", "utf8"));
    db.authenticate(
        auth.username,
        auth.password,
        null,
        function (err, result) {
            if (err) {
                throw err;
            }

            dbGroupC = db;

            app.post("/signup", signup);
            app.post("/signin", signin);
            app.post("/upload", upload);
            app.post("/gallery", gallery);
            app.post("/story", story);
            app.post("/position", position);
            app.post("/route", route);
            app.post("/edit", edit);
            app.post("/unlocked", unlocked);
            app.post("/debug", function (req, res) {
                req.setEncoding("utf8");
                req.on("data", function (chunk) {
                    console.log(chunk);
                });
                req.on("end", function () {
                    res.json({});
                });
            });
        });
});

function route(req, res) {
    if (req.body.route) {
        req.session.route = req.body.route;
        res.json({
            status: "SUCCESS",
            content: null
        });
    } else {
        res.json({
            status: "SUCCESS",
            content: {
                route: req.session.route
            }
        });
    }
}

function signup(req, res) {
    var user = req.body;

    if (user.username === "" || user.password === "") {
        res.json({
            status: "FAIL",
            content: "Please do not leave blank"
        });
        return;
    }

    user.password = hash.generate(user.password);
    user.unlocked = {
        0: [],
        1: [],
        2: []
    };

    dbGroupC.collection("USER")
        .insertOne(user, { w: 1 }, function (err, result) {
            if (err) {
                if (err.message.indexOf("duplicate key") > -1) {
                    res.json({
                        status: "FAIL",
                        content: "Username duplicate"
                    });
                } else {
                    res.json({
                        status: "FAIL",
                        content: err.message
                    });
                }
            } else {
                res.json({
                    status: "SUCCESS",
                    content: null
                });
            }
        });
}

function signin(req, res) {
    var user = req.body;

    if (user.facebook) {
        req.session.user = user.username;
        res.json({
            status: "SUCCESS",
            content: null
        });
    } else {
        dbGroupC.collection("USER")
            .find({ username: user.username }).limit(1)
            .next(function (err, item) {
                if (err) {
                    res.json({
                        status: "FAIL",
                        content: err.message
                    });
                } else {
                    if (item) {
                        if (hash.verify(user.password, item.password)) {
                            req.session.user = user.username;
                            res.json({
                                status: "SUCCESS",
                                content: null
                            });
                        } else {
                            res.json({
                                status: "FAIL",
                                content: "Password not matched"
                            });
                        }
                    } else {
                        res.json({
                            status: "FAIL",
                            content: "User not found"
                        });
                    }
                }
            });
    }
}

function upload(req, res) {
    var base64_str = "";
    req.setEncoding("utf8");
    req.on("data", function (chunk) {
        base64_str += chunk;
    });
    req.on("end", function () {
        var matches = base64_str.match(/^data:[A-Za-z-+]+\/([A-Za-z-+]+);base64,(.+)$/),
            data = new Buffer(matches[2], "base64");
        if (req.session.user && req.session.route) {
            dbGroupC.collection("IMAGE")
                .insertOne({
                    user: req.session.user,
                    type: matches[1],
                    story: "",
                    title: ""
                }, { w: 1 }, function (err, result) {
                    if (err) {
                        res.json({
                            status: "FAIL",
                            content: err.message
                        });
                    } else {
                        var save_path = "/upload_images/";
                        save_path += result.insertedId.toHexString();
                        save_path += "." + matches[1];

                        fs.writeFile("public" + save_path, data, function (err) {
                            if (err) {
                                res.json({
                                    status: "FAIL",
                                    content: "Write file error"
                                });
                            } else {
                                var un_p = find_unlocked(
                                    Number(req.session.route),
                                    Number(req.session.lng),
                                    Number(req.session.lat)
                                );

                                dbGroupC.collection("USER")
                                    .find({ username: req.session.user }).limit(1)
                                    .next(function (err, item) {
                                        if (err) {
                                            res.json({
                                                status: "FAIL",
                                                content: err.message
                                            });
                                        } else {
                                            if (un_p === -1 || item.unlocked[req.session.route].indexOf(un_p) !== -1) {
                                                res.json({
                                                    status: "SUCCESS",
                                                    content: {
                                                        path: save_path,
                                                        unlocked: -1
                                                    }
                                                });
                                            } else {
                                                res.json({
                                                    status: "SUCCESS",
                                                    content: {
                                                        path: save_path,
                                                        unlocked: un_p
                                                    }
                                                });
                                                item.unlocked[req.session.route].push(un_p);
                                                dbGroupC.collection("USER")
                                                    .findOneAndUpdate(
                                                        { username: req.session.user },
                                                        { $set: { unlocked: item.unlocked } },
                                                        { returnOriginal: false },
                                                        function (err, result) {
                                                            if (err) {
                                                                console.log(err.message);
                                                            }
                                                        }
                                                    );
                                            }
                                        }
                                    });
                            }
                        });
                    }
                });
        } else {
            res.json({
                status: "FAIL",
                content: "Not sign in yet or not choose a route"
            });
        }
    });
}

function gallery(req, res) {
    if (req.session.user) {
        var images = [];

        dbGroupC.collection("IMAGE")
            .find({ user: req.session.user })
            .toArray(function (err, docs) {
                if (err) {
                    res.json({
                        status: "FAIL",
                        content: err.message
                    });
                } else {
                    docs.forEach(function (doc) {
                        images.push("/upload_images/" + doc._id + "." + doc.type);
                    });
                    res.json({
                        status: "SUCCESS",
                        content: {
                            images: images
                        }
                    });
                }
            });
    } else {
        res.json({
            status: "FAIL",
            content: "Not sign in yet"
        });
    }
}

function story(req, res) {
    var stories = {}, counter = 0;

    req.body.images.forEach(function (name) {
        dbGroupC.collection("IMAGE")
            .find({ _id: ObjectID.createFromHexString(name) }).limit(1)
            .next(function (err, item) {
                counter += 1;
                if (!err) {
                    stories[name] = item.story;
                }
                if (counter === req.body.images.length) {
                    res.json({
                        status: "SUCCESS",
                        content: {
                            stories: stories
                        }
                    });
                }
            });
    });
}

function edit(req, res) {
    var name = req.body.image;

    delete req.body.image;
    dbGroupC.collection("IMAGE")
        .findOneAndUpdate(
            { _id: ObjectID.createFromHexString(name) },
            { $set: req.body },
            { returnOriginal: false },
            function (err, result) {
                if (err) {
                    res.json({
                        status: "FAIL",
                        content: err.message
                    });
                } else {
                    res.json({
                        status: "SUCCESS",
                        content: null
                    });
                }
            }
        );
}

function unlocked(req, res) {
    dbGroupC.collection("USER")
        .find({ username: req.session.user }).limit(1)
        .next(function (err, item) {
            if (err) {
                res.json({
                    status: "FAIL",
                    content: err.message
                });
            } else {
                res.json({
                    status: "SUCCESS",
                    content: {
                        point: item.unlocked[req.session.route]
                    }
                });
            }
        });
}

function position(req, res) {
    var position = req.body;
    var des = [
        [1200, 10000, 90, false],
        [1700, 10030, 90, false],
        [2200, 10040, 90, false],
        [2700, 10060, 90, true],
        [3200, 10060, 90, false],
        [3600, 10240, 0, false]
    ];

    req.session.lat = position.lat;
    req.session.lng = position.lng;

    if (isNaN(req.session.seq)) {
        req.session.seq = 0;
    } else {
        req.session.seq = (Number(req.session.seq) + 1) % des.length;
    }

    res.json({
        status: "SUCCESS",
        content: {
            desx: des[req.session.seq][0],
            desy: des[req.session.seq][1],
            r: des[req.session.seq][2],
            vibrate: des[req.session.seq][3]
        }
    });
}

function find_unlocked(route, lng, lat) {
    // demo
    if (route === 1) {
        return Math.floor(Math.random() * 5) + 1;
    } else if (route === 2) {
        return Math.floor(Math.random() * 5) + 6;
    } else if (route === 3) {
        return Math.floor(Math.random() * 5) + 11;
    }
}

var https_server = https.createServer(SSL, app);

https_server.listen(process.argv[2], function () {
    console.log("Listen on port " + process.argv[2]);
});
