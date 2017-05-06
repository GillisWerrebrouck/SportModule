document.addEventListener("DOMContentLoaded", function () {
    nsSportModule.init();
});

let nsSportModule = {
    base: "http://192.168.0.128:3000/api/",
    routesElement: null,
    selectedRoute: "",
    geoData: null,
    tphData: null,
    mapElement: null,
    map: null,
    showTph: true,

    init: function () {
        this.getRoutes();
    },

    getRoutes: function () {
        $.ajax(
            {
                type: "GET",
                url: this.base + "route",
                dataType: "jsonp",
                success: function (data) {
                    nsSportModule.showRoutes(data);
                },
                error: function (jqXHR, text, errorThrown) {
                    console.log(jqXHR + " " + text + " " + errorThrown);
                }
            }
        );
    },

    showRoutes: function (routes) {
        this.routesElement = document.getElementById("routes");

        for (route in routes) {
            route = routes[route];
            let optionElem = document.createElement("option");
            optionElem.value = route["routeId"];
            optionElem.text = route["startDate"] + " - " + route["endDate"];

            this.routesElement.appendChild(optionElem);
        }

        this.routesElement.addEventListener("change", function () {
            if (nsSportModule.routesElement.selectedIndex == 0) return;
            nsSportModule.getGeoData(nsSportModule.routesElement.options[nsSportModule.routesElement.selectedIndex].value);
        });
    },

    getGeoData: function (routeId) {
        if (routeId == "Select a route") return;
        nsSportModule.selectedRoute = routeId;

        $.ajax(
            {
                type: "GET",
                url: this.base + "geo/" + this.selectedRoute,
                dataType: "jsonp",
                success: function (data) {
                    nsSportModule.geoData = data;

                    if (nsSportModule.showTph) {
                        $.ajax(
                            {
                                type: "GET",
                                url: nsSportModule.base + "tph/" + nsSportModule.selectedRoute,
                                dataType: "jsonp",
                                success: function (data) {
                                    nsSportModule.tphData = data;
                                    nsSportModule.showMap();
                                },
                                error: function (jqXHR, text, errorThrown) {
                                    console.log(jqXHR + " " + text + " " + errorThrown);
                                }
                            }
                        );
                    } else {
                        nsSportModule.showMap();
                    }
                },
                error: function (jqXHR, text, errorThrown) {
                    console.log(jqXHR + " " + text + " " + errorThrown);
                }
            }
        );
    },

    showMap: function () {
        let mapOptions = {
            center: new google.maps.LatLng(nsSportModule.geoData[0].latitude, nsSportModule.geoData[0].longitude),
            zoom: 10,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        this.mapElement = document.getElementById("map");
        this.map = new google.maps.Map(this.mapElement, mapOptions);
        let infoWindow = new google.maps.InfoWindow();
        let lat_lng_nomaps = new Array();
        let lat_lng = new Array();
        let latlngbounds = new google.maps.LatLngBounds();

        // drawing the markers
        for (i = 0; i < nsSportModule.geoData.length; i++) {
            let data = nsSportModule.geoData[i];
            let myLatlng = new google.maps.LatLng(data.latitude, data.longitude);
            let myLatlngNomaps = [data.latitude, data.longitude, data.time];
            lat_lng.push(myLatlng);
            lat_lng_nomaps.push(myLatlngNomaps);

            let marker = new google.maps.Marker({
                position: myLatlng,
                map: nsSportModule.map
            });
            marker.setVisible(false);
            if (i == 0) {
                marker = new google.maps.Marker({
                    position: myLatlng,
                    map: nsSportModule.map,
                    icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                });
            }
            if (i == nsSportModule.geoData.length - 1) {
                marker = new google.maps.Marker({
                    position: myLatlng,
                    map: nsSportModule.map,
                    icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                });
            }

            if (!isNaN(marker.position.lat()) && !isNaN(marker.position.lng()))
                latlngbounds.extend(marker.position);

            (function (marker, data) {
                google.maps.event.addListener(marker, "click", function (e) {
                    infoWindow.setContent(data.title);
                    infoWindow.open(nsSportModule.map, marker);
                });
            })(marker, data);
        }
        nsSportModule.map.setCenter(latlngbounds.getCenter());
        nsSportModule.map.fitBounds(latlngbounds);

        // intialize the path array
        let path = new google.maps.MVCArray();

        // loop and draw the path between the points
        for (let i = 0; i <= lat_lng.length; i++) {
            if ((i + 1) <= lat_lng.length) {

                // set source and destination
                let src = lat_lng[i];
                let des = lat_lng[i + 1];
                path = [src, des];

                let color;

                // get distance, time and kmph from points
                if (des == undefined) return;

                if (nsSportModule.showTph) {
                    let temp = nsSportModule.tphData[i].temperature;
                    color = getColor(nsSportModule.mapValue(temp, 10, 30, 0, 1));
                } else {
                    let distance = nsSportModule.getDistanceBetweenCoordsInKm(src.lat(), src.lng(), des.lat(), des.lng());
                    let time = nsSportModule.getTimeFromDates(lat_lng_nomaps[i][2], lat_lng_nomaps[i + 1][2]);
                    let kmh = distance / time;
                    let colorPct = 1;

                    if (kmh < 35 && kmh > 0) {
                        colorPct = kmh / 35;
                    }

                    color = getColor(colorPct);
                }

                // set line properties
                let polyOptions = {
                    strokeColor: color,
                    strokeOpacity: 1.0,
                    strokeWeight: 3,
                    path: path,
                    map: nsSportModule.map
                }
                poly = new google.maps.Polyline(polyOptions);
            }
        }

        function getColor(pct) {
            let r = Math.round((255 * pct) / 1);
            let g = Math.round((255 * (1 - pct)) / 1);
            let b = 0;

            return 'rgb(' + [r, g, b].join(',') + ')';
        }
    },

    getDistanceBetweenCoordsInKm: function (lat1, lon1, lat2, lon2) {
        // Radius of the earth in km
        let earthRadius = 6371;
        let dLat = this.deg2rad(lat2 - lat1);
        let dLon = this.deg2rad(lon2 - lon1);
        let a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    },


    deg2rad: function (deg) {
        return deg * (Math.PI / 180)
    },

    getTimeFromDates: function (startDate, endDate) {
        let d1 = new Date(startDate);
        let d2 = new Date(endDate);
        let diffInMillis = d1.getTime() - d2.getTime();
        let diffInSeconds = diffInMillis / 1000;
        let diffInHours = Math.abs(diffInSeconds) / 3600;
        return diffInHours;
    },

    mapValue: function (value, in_min, in_max, out_min, out_max) {
        return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
}