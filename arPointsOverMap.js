Router.route("/ar/pointsOverMap/:latitude/:longitude", {
    name: "arPointsOverMapTemplate",
    /**
     */
    data: function () {
        Session.set("selectedLayout", "ar");
        myLatitude = this.params.latitude;
        myLongitude = this.params.longitude;
    }
});

var arr = [];
var video;
var imgUp;
var imgDown;
var idDevices = [];
var currentDevice;
var isCalibration = false;
var fixCourse;
var startCamera = false;
var notSupported = false;
var rango = 15;
var myLongitude;
var myLatitude;
var imgState = $("#imgState");

/**
 */
// var getPoints = function () {
//     var p;
//     // var s = Session.get("pointSet");
//     // if ( valid(s) ) {
//     //     var i;
//     //     for ( i in s ) {
//     //         p = {
//     //             lat: s[i].location.lat,
//     //             lng: s[i].location.lng,
//     //             nameSpa: s[i].name,
//     //             rumbo: '',
//     //             distancia: ''
//     //         };
//     //         arr.push(p);
//     //     }
//     // }
//     // else {
//     arr = [
//         {
//             lat: 7.3758203,
//             lng: -72.6486075,
//             nameSpa: "Catedral de Santa Clara",
//             rumbo: '',
//             distancia: ''
//         },
//         {
//             lat: 7.3767833,
//             lng: -72.647599,
//             nameSpa: "Museo Arte M Ramirez V",
//             rumbo: '',
//             distancia: ''
//         },
//         {
//             lat: 7.3769941,
//             lng: -72.648576,
//             nameSpa: "Casa Agueda Gallardo V",
//             rumbo: '',
//             distancia: ''
//         },
//         {
//             lat: 7.3757193,
//             lng: -72.6496717,
//             nameSpa: "Casa de Mercado",
//             rumbo: '',
//             distancia: ''
//         },
//         {
//             lat: 7.3771297,
//             lng: -72.6481897,
//             nameSpa: "Palacio Arzobispal",
//             rumbo: '',
//             distancia: ''
//         },
//         {
//             lat: 7.376562,
//             lng: -72.647277,
//             nameSpa: "Palacio Alcaldia Municipal",
//             rumbo: '',
//             distancia: ''
//         },
//         {
//             lat: 7.377002,
//             lng: -72.647969,
//             nameSpa: "Casa Familia Canal Gonzales",
//             rumbo: '',
//             distancia: ''
//         },
//         {
//             lat: 7.375819,
//             lng: -72.647729,
//             nameSpa: "Casa Soc. Sn Vicente Paul",
//             rumbo: '',
//             distancia: ''
//         },
//         {
//             lat: 7.376676,
//             lng: -72.648768,
//             nameSpa: "Casa Antigua - Parque",
//             rumbo: '',
//             distancia: ''
//         },
//         {
//             lat: 7.376598,
//             lng: -72.648857,
//             nameSpa: "Casa del Corregidor Joaquín Camacho y Lago",
//             rumbo: '',
//             distancia: ''
//         },
//         {
//             lat: 7.3769156,
//             lng: -72.6478947,
//             nameSpa: "Hotel Ursúa",
//             rumbo: '',
//             distancia: ''
//         }
//     ];
//     // arr.push(p);
//     // }
// };

/**
 */
var setCourse = function (lat, lng) {
    if (arr && lat && lng) {
        var topindex;
        var toploc;
        for (var i = 0; i < arr.length; i++) {
            topindex=Math.floor(Math.random() * 70) + 5;
            toploc=((window.innerHeight * topindex) /100) + "px";
            arr[i].rumbo = course(lng, lat, arr[i].lng, arr[i].lat);
            $("#locations").append("<span id='r" + i + "' class='location' style='top:"+toploc+"'>" + arr[i].nameSpa + " " + Math.floor(arr[i].rumbo) + "°</span>");
        }
    }
};

/**
 */
var course = function (lng1, lat1, lng2, lat2) {
    var incL = lng2 - lng1;

    if (incL == 0.0) {
        if (lat1 < lat2) {
            return 0.0;
        }
        else if (lat1 > lat2) {
            return 180.0;
        }
        else {
            return 0.0;
        }
    }

    var incLat = lat2 - lat1;
    if (incLat == 0.0) {
        if (lng1 < lng2) {
            return 90.0;
        }
        else if (lng1 > lng2) {
            return 270.0;
        }
        else {
            return 0.0;
        }
    }
    var incLonradians = (lng2 - lng1) * Math.PI / 180.0;
    var incLatradians = (lat2 - lat1) * Math.PI / 180.0;
    var lm = (lat1 + lat2) / 2.0;
    var lmradians = lm * Math.PI / 180.0;
    var coslm = Math.cos(lmradians);
    var Apradians = incLonradians * Math.abs(coslm);
    var tanR = Apradians / incLatradians;
    var Rradians = Math.atan(tanR);
    var R = Rradians * 180.0 / Math.PI;

    if (R > 0) {
        if (Apradians < 0) {
            R = 180.0 + R;
        }
    }
    else {
        if (Apradians > 0) {
            R = 180.0 + R;
        }
        else {
            R = 360.0 + R;
        }
    }
    return R;
};

/**
 */
var gotDevices = function (deviceInfos) {
    var countVidDev = 0;
    var i;
    for (i = 0; i !== deviceInfos.length; i++) {
        var deviceInfo = deviceInfos[i];
        if (deviceInfo.kind === "videoinput") {
            idDevices.push(deviceInfo.deviceId);
            countVidDev++;
        }
    }
    if (countVidDev > 1) {
        var imgSwitch = $("#imgSwitch");
        imgSwitch.click(function () {
            if (currentDevice == 0) {
                currentDevice = 1;
            }
            else {
                currentDevice = 0;
            }
            startDevice();
        });
        imgSwitch.show();
    }
    if (navigator.userAgent.indexOf("Chrome") != -1) {
        currentDevice = 1;
    }
    else {
        currentDevice = 0;
    }
    startDevice();
};

/**
 */
var gotStream = function (stream) {
    window.stream = stream;
    video.srcObject = stream;
    return navigator.mediaDevices.enumerateDevices();
};

/**
 */
var startDevice = function () {
    stopCamera();

    var constraints = {
        audio: false,
        video: {
            deviceId: idDevices[currentDevice] ? {exact: idDevices[currentDevice]} : undefined,
            width: {min: 320, ideal: 640, max: 1280},
            height: {min: 240, ideal: 480, max: 720}
        }
    };
    navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
};

/**
 */
var errorMsg = function (msg, error) {
    var errorElement = document.getElementById("divMsg");
    errorElement.innerHTML = "<img src='/ar/images/error.png' style='width:64px' /><p>" + msg + "</p>";
    errorElement.style.display = "block";
    errorElement.removeEventListener("click", setCaliCompass, true);
    removeListeners();
    if (typeof error !== "undefined") {
        console.log(error);
    }
};

/**
 */
var caliCompass = function () {
    var errorElement = document.getElementById("divMsg");
    errorElement.innerHTML = "<img src='/ar/images/location.png' style='width:64px' /><p>Ubica: <b style='color:orange'>" + arr[0].nameSpa + "</b> y toca la pantalla</p>";
    errorElement.style.display = "block";
    isCalibration = true;
    errorElement.addEventListener("click", setCaliCompass, true);
    window.addEventListener("deviceorientation", handleOrientation, true);
};

var loadingData = function () {
    var errorElement = document.getElementById("divMsg");
    errorElement.innerHTML = "<img src='/ar/images/loader.gif' style='width:42px' /><p>Cargando ubicaciones</p>";
    errorElement.style.display = "block";
};

var noDataFound = function () {
    var errorElement = document.getElementById("divMsg");
    errorElement.innerHTML = "<img src='/ar/images/nofound.png' style='width:64px' /><p>No se encontraron lugares cercanos</p>";
    errorElement.style.display = "block";
};

/**
 */
var setCaliCompass = function () {
    var errorElement = document.getElementById("divMsg");
    isCalibration = false;
    errorElement.innerHTML = "";
    errorElement.style.display = "none";
    errorElement.removeEventListener("click", setCaliCompass, true);
};

/**
 */
var closeCalibration = function () {
    var errorElement = document.getElementById("divMsg");
    errorElement.innerHTML = "";
    errorElement.style.display = "none";
    errorElement.removeEventListener("click", closeCalibration, true);
};

/**
 */
var handleOrientationAbs = function (event) {
    var alpha;
    var angDerecho, angIzquierdo, i;
    if (event.alpha != null) {
        if (!startCamera) {
            startCamera = true;
            document.getElementById("imgCompass").style.display = "initial";

            if (Meteor.isCordova) {
                var permissions = cordova.plugins.permissions;
                permissions.hasPermission(permissions.CAMERA, checkPermissionCallback, null);

                function checkPermissionCallback(status) {
                    if (!status.hasPermission) {
                        var errorCallback = function () {
                            console.warn('Camera permission is not turned on');
                        }

                        permissions.requestPermission(
                            permissions.CAMERA,
                            function (status) {
                                if (!status.hasPermission) {
                                    errorCallback();
                                } else {
                                    navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
                                }
                            },
                            errorCallback);
                    } else {
                        navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
                    }
                }
            } else {
                navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
            }

            window.addEventListener("compassneedscalibration", function (event) {
                document.getElementById("divMsg").innerHTML = "<img src='/ar/images/cal-compass.gif' style='width: 128px;' /><p>Tu brújula necesita ser calibrada.<br>Toca para salir</p>";
                document.getElementById("divMsg").addEventListener("click", closeCalibration, true);
                event.preventDefault();
            }, true);
        }

        //noinspection JSUnresolvedVariable
        if (event.webkitCompassHeading) {
            //noinspection JSUnresolvedVariable
            alpha = Math.floor(event.webkitCompassHeading);
        } else {
            alpha = Math.floor(Math.abs(360 - event.alpha));
        }

        angDerecho = alpha + rango;
        if (angDerecho > 360) {
            angDerecho = angDerecho - 360;
        }

        angIzquierdo = alpha - rango;
        if (angIzquierdo < 0) {
            angIzquierdo = 360 + angIzquierdo;
        }

        document.getElementById("imgCompass").style.transform = "rotate(" + alpha + "deg)";
        //document.getElementById("divMsg").innerHTML = "l:" + angIzquierdo + " c:" + alpha + " r:" + angDerecho; //+ " absoluto:" + absolute;
        if (arr) {
            for (i = 0; i < arr.length; i++) {
                var angDerechoA = angDerecho;
                if (angIzquierdo > angDerecho && (angDerecho - arr[i].rumbo) < 0) {
                    angDerechoA += 360;
                }
                var left = (((rango * 2) - (angDerechoA - arr[i].rumbo)) * window.innerWidth) / (rango * 2);
                var point = $("#r" + i);
                point.css("left", left);
            }
        }
    }
    else {
        window.removeEventListener("deviceorientationabsolute", handleOrientationAbs, true);
        caliCompass();
    }
};

/**
 */
var handleOrientation = function (event) {
    var alpha, absolute = false;
    var angDerecho, angIzquierdo, i;
    if (event.alpha != null) {
        if (event.webkitCompassHeading) {
            absolute = true;
            alpha = Math.floor(event.webkitCompassHeading);
        }
        else {
            alpha = Math.floor(Math.abs(360 - event.alpha));
        }

        if (!startCamera) {
            startCamera = true;
            document.getElementById("imgCompass").style.display = "initial";

            if (Meteor.isCordova) {
                var permissions = cordova.plugins.permissions;
                permissions.hasPermission(permissions.CAMERA, checkPermissionCallback, null);

                function checkPermissionCallback(status) {
                    if (!status.hasPermission) {
                        var errorCallback = function () {
                            console.warn('Camera permission is not turned on');
                        }

                        permissions.requestPermission(
                            permissions.CAMERA,
                            function (status) {
                                if (!status.hasPermission) {
                                    errorCallback();
                                } else {
                                    navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
                                }
                            },
                            errorCallback);
                    }
                    else {
                        navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
                    }
                }
            } else {
                navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
            }

            window.addEventListener("compassneedscalibration", function (event) {
                document.getElementById("divMsg").innerHTML = "<img src='/ar/images/cal-compass.gif' style='width: 128px;' /><p>Tu brújula necesita ser calibrada.<br>Toca para salir</p>";
                document.getElementById("divMsg").addEventListener("click", closeCalibration, true);
                event.preventDefault();
            }, true);
        }
        if (!isCalibration) {
            alpha -= fixCourse;
            angDerecho = alpha + rango;
            if (angDerecho > 360) {
                angDerecho = angDerecho - 360;
            }

            angIzquierdo = alpha - rango;
            if (angIzquierdo < 0) {
                angIzquierdo = 360 + angIzquierdo;
            }

            document.getElementById("imgCompass").style.transform = "rotate(" + alpha + "deg)";
            if (arr) {
                for (i = 0; i < arr.length; i++) {
                    var angDerechoA = angDerecho;
                    if (angIzquierdo > angDerecho && (angDerecho - arr[i].rumbo) < 0) {
                        angDerechoA += 360;
                    }
                    var left = (((rango * 2) - (angDerechoA - arr[i].rumbo)) * window.innerWidth) / (rango * 2);
                    var point = $("#r" + i);
                    point.css("left", left);
                }
            }
        }
        else {
            fixCourse = alpha - arr[0].rumbo;
        }
    }
    else {
        removeListeners();
        errorMsg("Tu dispositivo no cuenta con giroscopio");
    }
};

/**
 */
var removeListeners = function () {
    notSupported = true;
    window.removeEventListener("devicemotion", handleMotion, true);
    window.removeEventListener("deviceorientation", handleOrientation, true);
    window.removeEventListener("deviceorientationabsolute", handleOrientationAbs, true);
    video.style.display = "none";
    stopCamera();
};

/**
 */
var stopCamera = function () {
    if (window.stream) {
        //noinspection JSUnresolvedFunction
        window.stream.getTracks().forEach(function (track) {
            track.stop();
        });
    }
    if (video.srcObject) {
        video.srcObject = null;
    }
};

/**
 */
var handleMotion = function (event) {
    //noinspection JSUnresolvedVariable
    var aZ = event.accelerationIncludingGravity.z;
    if (notSupported) {
        removeListeners()
    }
    if (aZ && imgState) {
        aZ = Math.ceil(aZ);
        if (aZ <= 0) {
            imgState.attr('src', imgUp.src);
            if (imgState.css('display') == "none") {
                imgState.fadeIn("fast");
            }
        }
        else if (aZ > 6) {
            imgState.attr('src', imgDown.src);
            if (imgState.css('display') == "none") {
                imgState.fadeIn("fast");
            }
        } else {
            if (imgState.css('display') != "none") {
                imgState.hide();
            }
        }
    }
};

/**
 */
Template.arPointsOverMapTemplate.onDestroyed(function () {
    window.removeEventListener("devicemotion", handleMotion, true);
    window.removeEventListener("deviceorientation", handleOrientation, true);
    window.removeEventListener("deviceorientationabsolute", handleOrientationAbs, true);
    stopCamera();
    isCalibration = false;
    startCamera = false;
    notSupported = false;
    myLongitude = undefined;
    myLatitude = undefined;
    arr = [];
    $("#locations").empty();
});

/**
 */
Template.arPointsOverMapTemplate.onRendered(function () {
    $(window).resize(function () {
        if (video) {
            video.setAttribute("height", window.innerHeight.toString());
            video.setAttribute("width", window.innerWidth.toString());
        }
    });

    video = document.querySelector("video");
    var lat = parseFloat(myLatitude);
    var lng = parseFloat(myLongitude);

    if (lat && lng) {
        //$("#imgBack").click(function () { Router.go("/geolocation/index"); });
        imgUp = new Image();
        imgUp.src = '/ar/images/arrows-down.png';
        imgDown = new Image();
        imgDown.src = '/ar/images/arrows-up.png';
        if ("ondeviceorientation" in window) {
            if ("ondevicemotion" in window) {
                video.setAttribute("height", window.innerHeight.toString());
                video.setAttribute("width", window.innerWidth.toString());
                // getPoints();
                loadingData();
                Meteor.call("getFichasGenerales", lat, lng, function (e, r) {
                    closeCalibration();
                    if (!valid(e) && valid(r)) {
                        if (r.length > 0) {
                            arr = r;
                            console.log(arr);
                            setCourse(lat, lng);
                            window.addEventListener("devicemotion", handleMotion, true);
                            if ("ondeviceorientationabsolute" in window) {
                                window.addEventListener("deviceorientationabsolute", handleOrientationAbs, true);
                            } else {
                                caliCompass();
                            }
                        }else{
                            noDataFound();
                        }
                    }
                });

            } else {
                errorMsg("Tu navegador no soporta motion device")
            }
        } else {
            errorMsg("Tu navegador no soporta orientation device")
        }
    }
    else {
        Router.go("/geolocation/index");
    }
});

Template.arPointsOverMapTemplate.events({
    /**
     */
    "click #imgBack": function () {
        //Router.go("/ar/calibration");
        Router.go("/geolocation/index");
    }
});
