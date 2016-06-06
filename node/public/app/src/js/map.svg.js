/*global Snap:false*/

var selector, pos_cache;
var SVG_W = 9078, SVG_H = 16107, WANT_W = 1440, WANT_H = 2176;
var cenx = 0, ceny = 0;
var positionWatchId;
var transformString;
var transformModified = {
    scale: 1,
    translateX: 0,
    translateY: 0
};

$(window).resize(function () {
    applyPosition(pos_cache);
});

function MapSVG() {
    "use strict";
    var map_url = "/app/src/img/MAP.svg";
    this.loadMap = function (s) {
        selector = s;
        touch.on(selector, "drag pinch", function (eve) {
            var transformModifiedString, g = Snap(selector).select("g");
            var scaleCenterX, scaleCenterY;
            transformModified.translateX += eve.x ? eve.x : 0;
            transformModified.translateY += eve.y ? eve.y : 0;
            transformModified.scale *= eve.scale ? (eve.scale > 1 ? 1 + eve.scale * 0.01 : 1 - eve.scale * 0.1) : 1;
            if (transformModified.scale > 1.15) {
                transformModified.scale = 1.15;
            } else if (transformModified.scale < 0.25) {
                transformModified.scale = 0.25;
            }
            scaleCenterX = cenx + transformModified.translateX;
            scaleCenterY = ceny + transformModified.translateY;
            transformModifiedString = [
                "m1,0,0,1,",
                ((-scaleCenterX) * (transformModified.scale - 1)),
                ",",
                ((-scaleCenterY) * (transformModified.scale - 1)),
                "m",
                transformModified.scale,
                ",0,0,",
                transformModified.scale,
                ",0,0",
                "m1,0,0,1,",
                transformModified.translateX,
                ",",
                transformModified.translateY
            ].join("");
            g.transform(
                transformModifiedString + transformString
            );
            // debug(eve);
        });
        $(selector).children().remove();
        Snap.load(map_url, function (f) {
            f.select("svg").attr({
                height: "100%",
                width: "100%",
                preserveAspectRatio: "xMinYMin slice"
            });
            var snap = Snap(selector);
            snap.attr({
                overflow: "hidden"
            });
            snap.append(f);
            TweenMax.staggerTo(".point", 2, {
                attr: {
                    r: 150
                },
                opacity: 0,
                repeat: -1
            }, 1);
            /*
            positionWatchId = navigator.geolocation.watchPosition(
                applyPosition,
                function (err) {
                },
                {
                    timeout: 2000
                }
            );
            */
            applyPosition({
                coords: {
                    latitude: 0,
                    longitude: 0
                }
            });
        });
    };
}

function applyPosition(pos) {
    var divx = $(selector).width(),
        divy = $(selector).height(),
        heading = (isNaN(pos.coords.heading) || !pos.coords.heading) ? 0 : pos.coords.heading,
        transform = "",
        scale,
        translateX,
        translateY;

    pos_cache = pos;

    $.ajax({
        method: "POST",
        url: "/position",
        contentType: "application/json",
        data: JSON.stringify({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude
        }),
        success: function (obj) {
            if (divx * SVG_H / SVG_W > divy) { // limit by x
                scale = Math.min(SVG_W / WANT_W, divy * SVG_W / (divx * WANT_H)) * transformModified.scale;
                cenx = 0.5 * SVG_W;
                ceny = 0.5 * SVG_W * divy / divx;
            } else {
                scale = Math.min(SVG_H / WANT_H, divx * SVG_H / (divy * WANT_W)) * transformModified.scale;
                cenx = 0.5 * SVG_H * divx / divy;
                ceny = 0.5 * SVG_H;
            }
            Snap(selector).select("g#footstep").transform(
                "m1,0,0,1," + obj.content.desx + "," + obj.content.desy
            );
            transform += "m1,0,0,1," + (cenx - obj.content.desx) + "," + (ceny - obj.content.desy);
            transform += "m1,0,0,1," + ((-obj.content.desx) * (scale - 1)) + "," + ((-obj.content.desy) * (scale - 1));
            transform += "m" + scale + ",0,0," + scale + ",0,0";
            transformString = transform;
            Snap(selector).select("g").animate({
                transform: transform
            }, 4000);
        },
        dataType: "json"
    });
}

function debug(v) {
    $.ajax({
        method: "POST",
        url: "/debug",
        contentType: "text/plain",
        data: JSON.stringify(v),
        success: function (obj) {
        },
        dataType: "json"
    });
}
