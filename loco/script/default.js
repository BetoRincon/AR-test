var map;
var marker;
var infoWindow;
var positionOption = { timeout:'Infinity', enableHighAccuracy: true };

if (location.href.indexOf("https://") == -1 && location.href.indexOf("localhost") == -1) { location.href = location.href.replace("http://", "https://") };
$(document).ready(function () {
    $("#imglocation").click(function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                    var pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    if (marker) { marker.setMap(null) };
                    infoWindow.close();
                    marker = new google.maps.Marker({ position: pos, map: map, draggable: true });
                    infoWindow.setContent("Tu ubicacion");
                    marker.addListener('click', function () {
                        infoWindow.open(map, marker);
                    });
                    map.setCenter(pos);
            }, function () {
                    handleLocationError(true);
            }, positionOption);
        } else {
                handleLocationError(false);
            }
    });
    $("#imgnext").click(function () {
        if (marker) {
            location = "camera.html?lat=" + marker.getPosition().lat() + "&lng=" + marker.getPosition().lng();
        }
    });
});

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 7.377317, lng: -72.6500397 },
        disableDoubleClickZoom: false,
        zoom: 17,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
        options: { mapTypeControl: false, disableDoubleClickZoom: false, streetViewControl: false, clickableIcons: false }

    });

    infoWindow = new google.maps.InfoWindow();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            marker = new google.maps.Marker({ position: pos, map: map, draggable: true });
            infoWindow.setContent("Tu ubicacion");
            marker.addListener('click', function () {
                infoWindow.open(map, marker);
            });
            map.setCenter(pos);
        }, function () {
            handleLocationError(true);
        }, positionOption);
    } else {
        handleLocationError(false);
    }
}

function handleLocationError(browserHasGeolocation) {
    var pos = {
        lat: map.getCenter().lat(),
        lng: map.getCenter().lng()
    };
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
                          'Verifica que tienes activado tu GPS,<br>toca el icono para reintentar. <img style="text-align:center" src="images/reload.png" onclick="location.reload();" alt="Recargar"><br>' :
                          'Error: Tu navegador no admite geolocalización.');
    infoWindow.open(map);
}

function addMarker(pos) {
    marker = new google.maps.Marker({
        position: pos,
        map: map
    });
}
