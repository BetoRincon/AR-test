Router.route("ar/calibration", {
    name: "arCalibrationTemplate",
    /**
    */
    data: function()
    {
        Session.set("selectedLayout", "ar");
    }
});

var map;
var marker;
var infoWindow;
var positionOption = { timeout:'Infinity', enableHighAccuracy: true };

/**
*/
var handleLocationError = function(broHasGeo) {
    //noinspection JSUnresolvedFunction
    var pos = {
        lat: map.getCenter().lat(),
        lng: map.getCenter().lng()
    };
    //noinspection JSUnresolvedFunction
    infoWindow.setPosition(pos);
    infoWindow.setContent(broHasGeo ?
        'Verifica que tienes activado tu GPS,<br>toca el icono para reintentar. <img style="text-align:center;width: 50px;" src="images/reload.png" onclick="window.location=window.location.href;" alt="Recargar"><br>' :
        'Error: Tu navegador no admite geolocalización.');
    infoWindow.open(map);
};

/**
*/
var initAr = function() 
{
    try {
        if ( valid(google) && valid(google.maps) )  {
        }
    }
    catch ( e ) {
        alert("No está disponible el API Google Maps, posiblemente no se ha podido descargar, verifique su conexión a internet");
        return;
    }
    var e = document.getElementById("map");
    if (!e) {
        alert("No encuentro el MAP en el DOM");
        return;
    }
    //noinspection JSUnresolvedVariable
    map = new google.maps.Map(e, {
        center: { lat: 7.377317, lng: -72.6500397 },
        zoom: 17,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
        options: { mapTypeControl: false, disableDoubleClickZoom: true, streetViewControl: false, clickableIcons: false }
    });
    //noinspection JSUnresolvedVariable,JSUnresolvedFunction
    infoWindow = new google.maps.InfoWindow();

    if ( Meteor.isCordova ) {
        var permissions = cordova.plugins.permissions;
        permissions.hasPermission(
            permissions.ACCESS_FINE_LOCATION, 
            checkPermissionCallback, 
            null);
        var checkPermissionCallback = function(status) 
        {
            if(!status.hasPermission) {
                var errorCallback = function() {
                    console.warn('location permission is not turned on');
                }
                permissions.requestPermission(
                    permissions.ACCESS_FINE_LOCATION,
                    function(status) {
                        if(!status.hasPermission){
                            errorCallback();
                        }else{
                            cordova.plugins.diagnostic.isGpsLocationEnabled(function(enabled){
                                if (enabled){
                                    getcurrentpost();
                                }else{
                                    handleLocationError(true);
                                }
                            }, function(error){
                                handleLocationError(false);
                            });
                        }
                    },
                    errorCallback);
            }else{
                cordova.plugins.diagnostic.isGpsLocationEnabled(function(enabled){
                   if (enabled){
                       getcurrentpost();
                   }else{
                       handleLocationError(true);
                   }
                }, function(error){
                    handleLocationError(false);
                });
            }
        };
    }
    else{
        getcurrentpost();
    }
};

/**
*/
var getcurrentpost = function()
{
    if ( navigator.geolocation ) {
        var newPositionCallback = function (position) 
        {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            marker = new google.maps.Marker({ position: pos, map: map, draggable: true });
            infoWindow.setContent("Tu ubicación");
            marker.addListener('click', function () {
                infoWindow.open(map, marker);
            });
            map.setCenter(pos);
            infoWindow.open(map, marker);
            $("#imglocation").show();
        };
        navigator.geolocation.getCurrentPosition(newPositionCallback, function () {
            handleLocationError(true);
        }, positionOption);
    }
    else {
        handleLocationError(false);
    }
};

/**
*/
Template.arCalibrationTemplate.onRendered(function() 
{
    console.log("entroae");
    initAr();
});

/**
*/
Template.arCalibrationTemplate.onDestroyed(function()
{
    marker = null;
    infoWindow = null;
});

Template.arCalibrationTemplate.events({
    "click #imglocation": function(event, template)
    {
        if ( navigator.geolocation ) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                if (marker) { //noinspection JSUnresolvedFunction
                    marker.setMap(null) }
                infoWindow.close();
                //noinspection JSUnresolvedVariable,JSUnresolvedFunction
                marker = new google.maps.Marker({ position: pos, map: map, draggable: true });
                infoWindow.setContent("Tu ubicación");
                marker.addListener('click', function () {
                    infoWindow.open(map, marker);
                });
                //noinspection JSUnresolvedFunction
                map.setCenter(pos);
            }, function () {
                handleLocationError(true);
            }, positionOption);
        } 
        else {
            handleLocationError(false);
        }
    },
    "click #imgnext": function(event, template)
    {
        if ( marker ) {
            var url = "/ar/pointsOverMap/" +
                marker.getPosition().lat() + "/" +
                marker.getPosition().lng();
            Router.go(url);
        }
    },
    "click #imgbackf": function(event, template)
    {
        Router.go("/");
    }
});
