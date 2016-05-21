var fs = require("fs");
var path = require("path");
var express = require("express");
var body_parser = require("body-parser");
var firebase = require("firebase");
var session = require("express-session");

var app = new express();

firebase.initializeApp({
    databaseURL: "https://story-scaner.firebaseio.com/",
    serviceAccount: "auth.json"
});
var db = firebase.database(),
    col_images = db.ref("images");

app.use("/static", express.static(path.join(__dirname, "public")));
app.use(["/signup", "/signin", "/story"], body_parser.json());
app.use(session({
    secret: "adminstrator",
    resave: false,
    saveUninitialized: false
}));

app.post("/signup", function (req, res) {
    var user = req.body;
    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
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
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    });
    db.ref("users/" + user.username)
        .once("value", function (user_snapshot) {
            if (user_snapshot.exists()) {
                if (user_snapshot.val().password === user.password) {
                    req.session.user = user.username;
                    var images = [];
                    col_images.orderByChild("user")
                        .equalTo(user.username)
                        .once("value", function (images_snapshot) {
                            images_snapshot.forEach(function (image_snapshot) {
                                images.push("/static/upload_images/" + image_snapshot.key + ".jpg");
                            })
                            res.end(JSON.stringify({
                                status: "SUCCESS",
                                content: images
                            }));
                        });
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

app.post("/upload", function (req, res) {
    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    });
    if (req.session.user) {
        var image = col_images.push();
        image.set({
            user: req.session.user,
            lat: 25.234,
            lon: 121.234
        });
        var save_path = "/upload_images/" + image.key + ".jpg",
            o_file_stream = fs.createWriteStream(path.join(__dirname, "public" + save_path));
        req.pipe(o_file_stream).on('finish', function () {
            res.end(JSON.stringify({
                status: "SUCCESS",
                content: {
                    path: "/static" + save_path
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

app.post("/story", function (req, res) {
    var stories = {};
    res.set({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
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

app.listen(process.argv[2], function () {
    console.log("Listen on port " + process.argv[2]);
});
