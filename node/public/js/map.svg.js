/*global Snap:false*/

function MapSVG() {
    "use strict";
    var map_url = "../images/MAP.svg",
        snap;
    this.loadMap = function (selector) {
        var parsed_pos = {
            divx: $(selector).width(),
            divy: $(selector).height()
        };
        var $img = $("<img src='/images/footstep.gif'></img>");
        $img.css({
            "height": "13%",
            "z-index": 2,
            "position": "absolute"
        });
        $(selector).children().remove();
        $(selector).append($img);
        snap = Snap(selector);
        snap.attr({
            overflow: "hidden"
        });
        Snap.load(map_url, function (f) {
            f.select("svg").attr({
                height: "100%",
                width: "100%",
                preserveAspectRatio: "xMinYMin slice"
            });
            snap.append(f);
            navigator.geolocation.getCurrentPosition(
                function (pos) {
                    parsed_pos.lat = pos.coords.latitude;
                    parsed_pos.lon = pos.coords.longitude;
                    parsed_pos.heading = isNaN(pos.coords.heading) ? 0 : pos.coords.heading;
                    $.ajax({
                        method: "POST",
                        url: "/position",
                        contentType: "application/json",
                        data: JSON.stringify(parsed_pos),
                        success: function (obj) {
                            $img = $(selector + " img");
                            $img.css({
                                "top": parsed_pos.divy / 2,
                                "left": (parsed_pos.divx - $img.width()) / 2,
                                "display": "none"
                            });
                            snap.select("g").animate({
                                transform: obj.content.transform
                            }, 4000, null, function () {
                                $img.fadeIn();
                            });
                        },
                        dataType: "json"
                    });
                },
                function (err) {
                },
                {
                    enableHighAccuracy: true
                }
            );
        });
    };
}
