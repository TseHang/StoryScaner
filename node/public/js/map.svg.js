/*global Snap:false*/

var selector, posi_cache;

$(window).resize(function () {
    applyPosition(posi_cache);
});

function MapSVG() {
    "use strict";
    var map_url = "../images/MAP.svg";
    this.loadMap = function (s) {
        var $img = $("<img src='/images/footstep.gif'></img>");
        selector = s;
        $img.css({
            "height": "10%",
            "z-index": 2,
            "position": "absolute",
            "display": "none"
        });
        $(selector).children().remove();
        $(selector).append($img);
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
            $("circle").on("click", function () {
                window.alert("Don't click me!");
            });
            navigator.geolocation.watchPosition(
                applyPosition,
                function (err) {
                },
                {
                    enableHighAccuracy: true,
                    timeout: 2000
                }
            );
            applyPosition({
                coords: {
                    latitude: 0,
                    longitutde: 0,
                    heading: 0
                }
            });
        });
    };
}

function applyPosition(pos) {
    posi_cache = pos;
    var parsed_pos = {
        divx: $(selector).width(),
        divy: $(selector).height(),
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        heading: (isNaN(pos.coords.heading) || !pos.coords.heading) ? 0 : pos.coords.heading
    };
    $.ajax({
        method: "POST",
        url: "/position",
        contentType: "application/json",
        data: JSON.stringify(parsed_pos),
        success: function (obj) {
            $img = $(selector + " img");
            $img.css({
                "top": (parsed_pos.divy + $img.height()) / 2,
                "left": (parsed_pos.divx - $img.width()) / 2
            });
            Snap(selector).select("g").animate({
                transform: obj.content.transform
            }, 4000, null, function () {
                $img.fadeIn();
            });
        },
        dataType: "json"
    });
}
