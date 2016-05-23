var fs = require("fs");
var path = require("path");
var express = require("express");
var https = require("https");
var body_parser = require("body-parser");
var firebase = require("firebase");
var session = require("express-session");
var ssl = {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("certificate.pem")
};

var app = new express();

firebase.initializeApp({
    databaseURL: "https://story-scaner.firebaseio.com/",
    serviceAccount: "auth.json"
});
var db = firebase.database(),
    col_images = db.ref("images");
var svgx = 9078, svgy = 16107, wantx = 1440, wanty = 2176;

app.use("/upload_images", express.static(path.join(__dirname, "public/upload_images")));
app.use("/", express.static(path.join(__dirname, "public")));
app.use(["/signup", "/signin", "/story", "/position"], body_parser.json());
app.use(session({
    secret: "adminstrator",
    resave: false,
    saveUninitialized: false
}));

app.post("/signup", function (req, res) {
    var user = req.body;
    res.set({
        "Content-Type": "application/json"
    });
    db.ref("users/" + user.username)
        .once("value", function (user_snapshot) {
            if (user_snapshot.exists()) {
                res.end(JSON.stringify({
                    status: "FAIL",
                    content: "Username duplicate"
                }));
            } else {
                user_snapshot.ref.set({
                    password: user.password
                });
                res.end(JSON.stringify({
                    status: "SUCCESS",
                    content: null
                }));
            }
        });
});

app.post("/signin", function (req, res) {
    var user = req.body;
    res.set({
        "Content-Type": "application/json"
    });
    db.ref("users/" + user.username)
        .once("value", function (user_snapshot) {
            if (user_snapshot.exists()) {
                if (user_snapshot.val().password === user.password) {
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
        });
});

app.post("/gallery", function (req, res) {
    res.set({
        "Content-Type": "application/json"
    });
    if (req.session.user) {
        var images = [];
        col_images.orderByChild("user")
            .equalTo(req.session.user)
            .once("value", function (images_snapshot) {
                images_snapshot.forEach(function (image_snapshot) {
                    images.push("/upload_images/" + image_snapshot.key + "." + image_snapshot.val().type);
                })
                res.end(JSON.stringify({
                    status: "SUCCESS",
                    content: {
                        images: images
                    }
                }));
            });
    } else {
        res.end(JSON.stringify({
            status: "FAIL",
            content: "Not sign in yet"
        }));
    }
});

app.post("/upload", function (req, res) {
    var base64_str = "";
    req.setEncoding("utf8");
    res.set({
        "Content-Type": "application/json"
    });
    req.on("data", function (chunk) {
        base64_str += chunk;
    });
    req.on("end", function () {
        var matches = base64_str.match(/^data:[A-Za-z-+]+\/([A-Za-z-+]+);base64,(.+)$/),
            data = new Buffer(matches[2], "base64");
        if (req.session.user) {
            var image = col_images.push();
            image.set({
                user: req.session.user,
                type: matches[1],
                lat: req.session.lat,
                lon: req.session.lon 
            });
            var save_path = "/upload_images/" + image.key + "." + matches[1];
            fs.writeFile("public" + save_path, data, function (err) {
                if (err) {
                    res.end(JSON.stringify({
                        status: "FAIL",
                        content: "Write file error"
                    }));
                    throw err;
                } else {
                    res.end(JSON.stringify({
                        status: "SUCCESS",
                        content: {
                            path: save_path
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
    });
});

app.post("/story", function (req, res) {
    var stories = {};
    res.set({
        "Content-Type": "application/json"
    });
    req.body.images.forEach(function (name) {
        stories[name] = "This is the story about me.";
    });
    res.end(JSON.stringify({
        status: "SUCCESS",
        content: {
            stories: stories
        }
    }));
});

app.post("/position", function (req, res) {
    var position = req.body;
    var desx = 4500, desy = 8000;
    res.set({
        "Content-Type": "application/json"
    });
    req.session.lat = position.lat;
    req.session.lon = position.lon;
    req.session.heading = position.heading;
    res.end(JSON.stringify({
        status: "SUCCESS",
        content: {
            transform: (function () {
                var transform = "",
                    scale, translatex, translatey;
                if (position.divx * svgy / svgx > position.divy) { // limit by x
                    scale = Math.min(svgx / wantx, position.divy * svgx / (position.divx * wanty));
                    translatex = (0.5 - desx * scale / svgx) * position.divx;
                    translatey = 0.5 * position.divy - desy * position.divx * scale / svgx;
                } else {
                    scale = Math.min(svgy / wanty, position.divx * svgy / (position.divy * wantx));
                    translatex = 0.5 * position.divx - desx * position.divy * scale / svgy;
                    translatey = (0.5 - desy * scale / svgy) * position.divy;
                }
                transform += "m" + scale + ",0,0," + scale + "," + translatex + "," + translatey;
                return transform;
            })()
        }
    }));
});

var https_server = https.createServer(ssl, app);

https_server.listen(process.argv[2], function () {
    console.log("Listen on port " + process.argv[2]);
});
