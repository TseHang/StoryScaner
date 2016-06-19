var fs = require("fs");
var d3 = require("d3");
var path = require("path");
var express = require("express");
var https = require("https");
var bodyParser = require("body-parser");
var session = require("express-session");
var mongo = require("mongodb").MongoClient;
var ObjectID = require("mongodb").ObjectID;
var hash = require("password-hash");
var cors = require("cors");
var sendmail = require("sendmail")();

var LOI = JSON.parse(fs.readFileSync("poi.json"));

// 140.116.177.150;
var DB_URL = "mongodb://140.116.177.150:27017/groupC";

var SSL = {
    key: fs.readFileSync("auth/key.pem"),
    cert: fs.readFileSync("auth/certificate.pem")
};

var app = new express();
var dbGroupC;

var log = fs.createWriteStream("err.log");

process.stderr.write = log.write.bind(log);
process.on("uncaughtException", function (err) {
    console.error("Error at: " + (new Date()).toLocaleString());
    console.error(err);
});

app.set("view engine", "pug");
app.use("/upload_images", express.static(path.join(__dirname, "public/upload_images")));
app.use("/poi_images", express.static(path.join(__dirname, "public/poi_images")));
app.use(cors());
app.use("/", express.static(path.join(__dirname, "public")));
app.use(["/signup", "/signin", "/story", "/position", "/route", "/edit", "/forgetpwd", "/resetpwd"], bodyParser.json());
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
            app.post("/signout", signout);
            app.post("/checkLogin", checkLogin);
            app.post("/upload", upload);
            app.post("/gallery", gallery);
            app.post("/story", story);
            app.post("/position", position);
            app.post("/route", route);
            app.post("/edit", edit);
            app.post("/points", points);
            app.post("/forgetpwd", forgetpwd);
            app.post("/resetpwd", resetpwd);
            app.get("/app/resetpwd", renderResetpwd);
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

function renderResetpwd(req, res) {
    var id;

    req.session.u = req.query.u;

    try {
        id = ObjectID.createFromHexString(req.session.u);
    } catch (err) {
        res.end("");
        return;
    }

    dbGroupC.collection("USER")
        .find({ _id: id }).limit(1)
        .next(function (err, item) {
            if (err) {
                handleError(res, err);
            } else {
                if (item) {
                    res.render("resetpwd", {
                        username: item.username
                    });
                } else {
                    res.json({
                        status: "FAIL",
                        content: "User not found"
                    });
                }
            }
        });
}

function resetpwd(req, res) {
    dbGroupC.collection("USER")
        .findOneAndUpdate(
            { _id: ObjectID.createFromHexString(req.session.u) },
            { $set: { password: hash.generate(req.body.password) } },
            { returnOriginal: false },
            function (err, result) {
                if (err) {
                    handleError(res, err);
                } else {
                    res.json({
                        status: "SUCCESS",
                        content: null
                    });
                }
            }
        );
}

function forgetpwd(req, res) {
    var email = req.body.email;

    dbGroupC.collection("USER")
        .find({ email: email }).limit(1)
        .next(function (err, item) {
            if (err) {
                handleError(res, err);
            } else {
                if (item) {
                    sendmail({
                        from: "no-reply@storyscaner.org",
                        to: email,
                        subject: "Password reset for StoryScaner",
                        content: ([
                            "Please click ",
                            "https://luffy.ee.ncku.edu.tw:",
                            process.argv[2],
                            "/app/resetpwd?u=",
                            item._id,
                            " to reset your password."
                        ].join(""))
                    }, function (err, reply) {
                        if (err) {
                            handleError(res, err);
                        } else {
                            res.json({
                                status: "SUCCESS",
                                content: null
                            });
                        }
                    });
                } else {
                    res.json({
                        status: "FAIL",
                        content: "Email not found"
                    });
                }
            }
        });
}

function checkLogin(req, res) {
    if (req.session.user) {
        res.json({
            status: "SUCCESS",
            content: {
                signed: true,
                username: req.session.user
            }
        });
    } else {
        res.json({
            status: "SUCCESS",
            content: {
                signed: false,
                username: ""
            }
        });
    }
}

function signout(req, res) {
    req.session.destroy(function (err) {
        if (err) {
            handleError(res, err);
        } else {
            res.json({
                status: "SUCCESS",
                content: null
            });
        }
    });
}

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
                route: req.session.route ? req.session.route : "2"
            }
        });
    }
}

function signup(req, res) {
    var user = req.body;

    if (user.username === "" || user.password === "" || user.email === "") {
        res.json({
            status: "FAIL",
            content: "Please do not leave blank"
        });
        return;
    }

    user.password = hash.generate(user.password);
    user.unlocked = {
        1: [],
        2: [],
        3: []
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
                    handleError(res, err);
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

    if (req.session.user) {
        res.json({
            status: "FAIL",
            content: "Already sign in!"
        });
    } else if (user.facebook === true) {
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
                    handleError(res, err);
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
                        handleError(res, err);
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
                                    req.session.route,
                                    Number(req.session.lng),
                                    Number(req.session.lat)
                                );

                                dbGroupC.collection("USER")
                                    .find({ username: req.session.user }).limit(1)
                                    .next(function (err, item) {
                                        if (err) {
                                            handleError(res, err);
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
                                                                console.error(err.message);
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
                    handleError(res, err);
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
    var contents = {}, counter = 0;

    req.body.images.forEach(function (name) {
        dbGroupC.collection("IMAGE")
            .find({ _id: ObjectID.createFromHexString(name) }).limit(1)
            .next(function (err, item) {
                counter += 1;
                if (!err) {
                    contents[name] = {
                        title: item.title,
                        story: item.story
                    };
                }
                if (counter === req.body.images.length) {
                    res.json({
                        status: "SUCCESS",
                        content: contents
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
                    handleError(res, err);
                } else {
                    res.json({
                        status: "SUCCESS",
                        content: null
                    });
                }
            }
        );
}

function points(req, res) {
    if (typeof req.session.user === "undefined" || typeof req.session.route === "undefined") {
        res.json({
            status: "FAIL",
            content: "Not sign in or choose a route yet"
        });
        return;
    }
    dbGroupC.collection("USER")
        .find({ username: req.session.user }).limit(1)
        .next(function (err, item) {
            if (err) {
                handleError(res, err);
            } else {
                var points = [];

                LOI[req.session.route].forEach(function (poi, index) {
                    poi.routeNum = index;
                    poi.unlocked = true; // (item.unlocked[req.session.route].indexOf(index) !== -1);
                    points.push(poi);
                });

                res.json({
                    status: "SUCCESS",
                    content: {
                        points: points
                    }
                });
            }
        });
}

function position(req, res) {
    var position = req.body,
        projection = project(position),
        content = {
            vibrate: false,
            desx: projection[0],
            desy: projection[1],
            r: position.heading
        };

    req.session.lat = position.lat;
    req.session.lng = position.lng;

    LOI[route].forEach(function (poi, index) {
        if (!content.vibrate && d3.geo.distance([poi.lng, poi.lat], [position.lng, position.lat]) * 6378137 < 5) {
            content.vibrate = true;
        }
    });

    res.json({
        status: "SUCCESS",
        content: content
    });
}

function project(position) {
    var x1 = 1350, y1 = 5500,
        x2 = 7800, y2 = 5700,
        x3 = 1350, y3 = 12000,
        x_pos, y_pos, x_neg, y_neg;
    var zoom = Math.sqrt(Math.pow(x2 - x3, 2) + Math.pow(y2 - y3, 2)) / 180.19;
    var r1 = d3.geo.distance([120.197682, 22.994236], [position.lng, position.lat]) * zoom,
        r2 = d3.geo.distance([120.198916, 22.993973], [position.lng, position.lat]) * zoom,
        r3 = d3.geo.distance([120.197439, 22.993040], [position.lng, position.lat]) * zoom;
    var m = (x1 - x2) / (y2 - y1),
        k = (r1 * r1 - r2 * r2 + x2 * x2 - x1 * x1 + y2 * y2 - y1 * y1) / (2 * (y2 - y1));
    var a = 1 + m * m,
        b = 2 * (m * k - m * y2 - x2),
        c = x2 * x2 + y2 * y2 + k * k - 2 * k * y2 - r2 * r2;

    if (b * b - 4 * a * c < 0) {
        return [-1, -1];
    } else {
        var result_pos, result_neg;
        x_pos = (Math.sqrt(b * b - 4 * a * c) - b) / (2 * a);
        y_pos = m * x_pos / k;
        result_pos = Math.pow(x_pos - x3, 2) + Math.pow(y_pos - y3, 2) - r3 * r3;
        x_neg = (-Math.sqrt(b * b - 4 * a * c) - b) / (2 * a);
        y_neg = m * x_neg / k;
        result_neg = Math.pow(x_neg - x3, 2) + Math.pow(y_neg - y3, 2) - r3 * r3;
        if (Math.abs(result_pos) > Math.abs(result_neg)) {
            return [x_neg, y_neg];
        } else {
            return [x_pos, y_pos];
        }
    }
}

function find_unlocked(route, lng, lat) {
    var found = -1;

    LOI[route].forEach(function (poi, index) {
        if (found === -1 && d3.geo.distance([poi.lng, poi.lat], [lng, lat]) * 6378137 < 5) {
            found = index;
        }
    });

    return found;
}

function handleError(res, err) {
    console.error(err);
    res.json({
        status: "FAIL",
        content: err.message
    });
}

var https_server = https.createServer(SSL, app);

https_server.listen(process.argv[2], function () {
    console.log("Listen on port " + process.argv[2]);
});
