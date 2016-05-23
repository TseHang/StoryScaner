/*global Snap:false*/

function MapSVG() {
    "use strict";
    var map_url = "../images/MAP.svg",
        snap;
    this.loadMap = function (selector) {
        snap = Snap(selector);
        snap.attr({
            overflow: "hidden"
        });
        Snap.load(map_url, function (f) {
            f.select("svg").attr({
                height: "100%",
                width: "100%",
                preserveAspectRatio: "xMidYMid slice"
            });
            snap.append(f);
            navigator.geolocation.getCurrentPosition(
                function (pos) {
                    var parsed_pos = {
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude,
                        heading: isNaN(pos.coords.heading) ? 0 : pos.coords.heading,
                        divx: $(selector).width(),
                        divy: $(selector).height()
                    };
                    $.ajax({
                        method: "POST",
                        url: "/position",
                        contentType: "application/json",
                        data: JSON.stringify(parsed_pos),
                        success: function (obj) {
                            snap.select("svg").animate({
                                transform: obj.content.transform
                            }, 4000);
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
