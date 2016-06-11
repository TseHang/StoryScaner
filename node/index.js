var fs = require("fs");
var path = require("path");
var express = require("express");
var https = require("https");
var bodyParser = require("body-parser");
var session = require("express-session");
var mongo = require("mongodb").MongoClient;
var hash = require("password-hash");

var DB_URL = "mongodb://localhost:27017/groupC";
var SSL = {
    key: fs.readFileSync("auth/key.pem"),
    cert: fs.readFileSync("auth/certificate.pem")
};

var app = new express();
var dbGroupC;

var log = fs.createWriteStream("err.log");

process.stdout.write = process.stderr.write = log.write.bind(log);

app.use("/upload_images", express.static(path.join(__dirname, "public/upload_images")));
app.use("/", express.static(path.join(__dirname, "public")));
app.use(["/signup", "/signin", "/story", "/position"], bodyParser.json());
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

function signup(req, res) {
    var user = req.body;

    if (user.username === "" || user.password === "") {
        res.json({
            status: "FAIL",
            content: "Please do not leave blank"
        });
    }

    user.password = hash.generate(user.password);

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
        if (req.session.user) {
            dbGroupC.collection("IMAGE")
                .insertOne({
                    user: req.session.user,
                    type: matches[1],
                    lat: (req.session.lat ? req.session.lat : 0),
                    lng: (req.session.lng ? req.session.lng : 0)
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
                                res.json({
                                    status: "SUCCESS",
                                    content: {
                                        path: save_path,
                                        story: "No content yet"
                                    }
                                });
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
    var stories = {};

    req.body.images.forEach(function (name) {
        stories[name] = "";
    });

    res.json({
        status: "SUCCESS",
        content: {
            stories: stories
        }
    });
}

function position(req, res) {
    var position = req.body;
    var desx = 4820, desy = 8250;

    req.session.lat = position.lat;
    req.session.lng = position.lng;

    res.json({
        status: "SUCCESS",
        content: {
            desy: desy,
            desx: desx
        }
    });
}

var https_server = https.createServer(SSL, app);

https_server.listen(process.argv[2], function () {
    console.log("Listen on port " + process.argv[2]);
});
