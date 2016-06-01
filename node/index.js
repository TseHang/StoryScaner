var fs = require("fs");
var path = require("path");
var express = require("express");
var https = require("https");
var bodyParser = require("body-parser");
var session = require("express-session");
var mongo = require("mongodb").MongoClient;

var DB_URL = "mongodb://localhost:27017/groupC";
var STORY_CONTENT = "日治時期日本成立各種農業產品運銷組織，臺南州青果同業組合於西市場設置香蕉倉庫，以利運銷。原空間於1930年之前原作為臺灣漁業株式會社之「魚賣場」，後因1935年前後該會社搬遷至運河旁，建築形貌與用途因之改變，其後成為「臺南州青果同業組合」之香蕉倉庫。本倉庫有冷藏、加溫等設施。香蕉，曾是臺灣重要的外銷農產品，因具歷史價值現已指定為古蹟。";
var SVG_W = 9078, SVG_H = 16107, WANT_W = 1440, WANT_H = 2176;
var SSL = {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("certificate.pem")
};

var app = new express();
var dbGroupC;

app.use("/upload_images", express.static(path.join(__dirname, "public/upload_images")));
app.use("/", express.static(path.join(__dirname, "public")));
app.use(["/signup", "/signin", "/story", "/position"], bodyParser.json());
app.use(session({
    secret: "adminstrator",
    resave: false,
    saveUninitialized: false
}));

mongo.connect(DB_URL, function (err, db) {
    if (err) {
        throw err;
    }

    var auth = JSON.parse(fs.readFileSync("auth.json", "utf8"));
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

    res.set({
        "Content-Type": "application/json"
    });

    if (user.username === "" || user.password === "") {
        res.end(JSON.stringify({
            status: "FAIL",
            content: "Please do not leave blank"
        }));
    }

    dbGroupC.collection("users")
        .insertOne(user, { w: 1 }, function (err, result) {
            if (err) {
                if (err.message.indexOf("duplicate key") > -1) {
                    res.end(JSON.stringify({
                        status: "FAIL",
                        content: "Username duplicate"
                    }));
                } else {
                    res.end(JSON.stringify({
                        status: "FAIL",
                        content: err.message
                    }));
                }
            } else {
                res.end(JSON.stringify({
                    status: "SUCCESS",
                    content: null
                }));
            }
        });
}

function signin(req, res) {
    var user = req.body;

    res.set({
        "Content-Type": "application/json"
    });

    dbGroupC.collection("users")
        .find({ username: user.username }).limit(1)
        .next(function (err, item) {
            if (err) {
                res.end(JSON.stringify({
                    status: "FAIL",
                    content: err.message
                }));
            } else {
                if (item) {
                    if (item.password === user.password) {
                        req.session.user = user.username;
                        res.end(JSON.stringify({
                            status: "SUCCESS",
                            content: null
                        }));
                    } else {
                        res.end(JSON.stringify({
                            status: "FAIL",
                            content: "Password not matched"
                        }));
                    }
                } else {
                    res.end(JSON.stringify({
                        status: "FAIL",
                        content: "User not found"
                    }));
                }
            }
        });
}

function upload(req, res) {
    res.set({
        "Content-Type": "application/json"
    });

    var base64_str = "";
    req.setEncoding("utf8");
    req.on("data", function (chunk) {
        base64_str += chunk;
    });
    req.on("end", function () {
        var matches = base64_str.match(/^data:[A-Za-z-+]+\/([A-Za-z-+]+);base64,(.+)$/),
            data = new Buffer(matches[2], "base64");
        if (req.session.user) {
            dbGroupC.collection("images")
                .insertOne({
                    user: req.session.user,
                    type: matches[1],
                    lat: (req.session.lat ? req.session.lat : 0),
                    lon: (req.session.lon ? req.session.lon : 0)
                }, { w: 1 }, function (err, result) {
                    if (err) {
                        res.end(JSON.stringify({
                            status: "FAIL",
                            content: err.message
                        }));
                    } else {
                        var save_path = "/upload_images/";
                        save_path += result.insertedId.toHexString();
                        save_path += "." + matches[1];

                        fs.writeFile("public" + save_path, data, function (err) {
                            if (err) {
                                res.end(JSON.stringify({
                                    status: "FAIL",
                                    content: "Write file error"
                                }));
                            } else {
                                res.end(JSON.stringify({
                                    status: "SUCCESS",
                                    content: {
                                        path: save_path,
                                        story: STORY_CONTENT
                                    }
                                }));
                            }
                        });
                    }
                });
        } else {
            res.end(JSON.stringify({
                status: "FAIL",
                content: "Not sign in yet"
            }));
        }
    });
}

function gallery(req, res) {
    res.set({
        "Content-Type": "application/json"
    });

    if (req.session.user) {
        var images = [];

        dbGroupC.collection("images")
            .find({ user: req.session.user })
            .toArray(function (err, docs) {
                if (err) {
                    res.end(JSON.stringify({
                        status: "FAIL",
                        content: err.message
                    }));
                } else {
                    docs.forEach(function (doc) {
                        images.push("/upload_images/" + doc._id + "." + doc.type);
                    });
                    res.end(JSON.stringify({
                        status: "SUCCESS",
                        content: {
                            images: images
                        }
                    }));
                }
            });
    } else {
        res.end(JSON.stringify({
            status: "FAIL",
            content: "Not sign in yet"
        }));
    }
}

function story(req, res) {
    var stories = {};

    res.set({
        "Content-Type": "application/json"
    });

    req.body.images.forEach(function (name) {
        stories[name] = STORY_CONTENT;
    });

    res.end(JSON.stringify({
        status: "SUCCESS",
        content: {
            stories: stories
        }
    }));
}

function position(req, res) {
    var position = req.body;
    var desx = 4950, desy = 8330, cenx, ceny;

    res.set({
        "Content-Type": "application/json"
    });

    req.session.lat = position.lat;
    req.session.lon = position.lon;

    res.end(JSON.stringify({
        status: "SUCCESS",
        content: {
            transform: (function () {
                var transform = "",
                    scale, translatex, translatey;
                if (position.divx * SVG_H / SVG_W > position.divy) { // limit by x
                    scale = Math.min(SVG_W / WANT_W, position.divy * SVG_W / (position.divx * WANT_H));
                    cenx = 0.5 * SVG_W;
                    ceny = 0.5 * SVG_W * position.divy / position.divx;
                    translatex = cenx - desx * scale;
                    translatey = ceny - desy * scale;
                } else {
                    scale = Math.min(SVG_H / WANT_H, position.divx * SVG_H / (position.divy * WANT_W));
                    cenx = 0.5 * SVG_H * position.divx / position.divy;
                    ceny = 0.5 * SVG_H;
                    translatex = 0.5 * SVG_H * position.divx / position.divy - desx * scale;
                    translatey = 0.5 * SVG_H - desy * scale;
                }
                transform += "m1,0,0,1," + (cenx - desx) + "," + (ceny - desy);
                transform += "r" + (position.heading > 0 ? position.heading : Math.round(Math.random() * 360)) + "," + desx + "," + desy;
                transform += "m1,0,0,1," + ((-desx) * (scale - 1)) + "," + ((-desy) * (scale - 1));
                transform += "m" + scale + ",0,0," + scale + ",0,0";
                return transform;
            })()
        }
    }));
}

var https_server = https.createServer(SSL, app);

https_server.listen(process.argv[2], function () {
    console.log("Listen on port " + process.argv[2]);
});
