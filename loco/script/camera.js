var CanvasObj;
var Context;
var video;
var imgUp;
var imgDown;
var imgNeedle;
var imgCom;
var idDevices = [];
var currentDevice;
var arr = [];
var startCamera = false;

$(document).ready(function () {
    var front = false;
    var videoSource;
    CanvasObj = document.querySelector("canvas");
    video = document.querySelector("video");

    var lat = parseFloat(getUrlParameter("lat"));
    var lng = parseFloat(getUrlParameter("lng"));

    if (lat && lng) {
        $("#imgBack").click(function () { location = "./" });
        if (CanvasObj && CanvasObj.getContext) {
            Context = CanvasObj.getContext("2d");
            if (Context) {
                imgUp = new Image(); imgUp.src = 'images/arrows-down.png';
                imgDown = new Image(); imgDown.src = 'images/arrows-up.png';
                imgNeedle = new Image(); imgNeedle.src = 'images/needle.png';
                imgCom = new Image(); imgCom.src = 'images/compass.png';

                if ("ondeviceorientation" in window) {
                    if ("ondevicemotion" in window) {
                        video.setAttribute("height", window.innerHeight);
                        video.setAttribute("width", window.innerWidth);
                        window.addEventListener("devicemotion", handleMotion, true);
                        if ("ondeviceorientationabsolute" in window) {
                            window.addEventListener("deviceorientationabsolute", handleOrientation, true);
                        } else {
                            window.addEventListener("deviceorientation", handleOrientation, true);
                        }
                        getPoints();
                        setCourse(lat, lng);
                    } else { errorMsg("Tu navegador no soporta motion device") }
                } else { errorMsg("Tu navegador no soporta orientation device") }
            }
        } else {
            errorMsg("Tu navegador no tiene soporte para html5");
        }
    } else { location = "./" }
});

function getPoints() {
    var p;
    p = {
        lat: 7.3746393,
        lng: -72.6442663,
        nameSpa: "Hospital",
        rumbo: '',
        distancia: ''
    };
    arr.push(p);
    p = {
        lat: 7.3757991,
        lng: -72.6434,
        nameSpa: "Terminal Buses",
        rumbo: '',
        distancia: ''
    };
    arr.push(p);
    p = {
        lat: 7.3758203,
        lng: -72.6486075,
        nameSpa: "Catedral",
        rumbo: '',
        distancia: ''
    };
    arr.push(p);
    p = {
        lat: 7.3769163,
        lng: -72.6478954,
        nameSpa: "Hotel",
        rumbo: '',
        distancia: ''
    };
    arr.push(p);
}

function setCourse(lat, lng) {
    if (arr && lat && lng) {
        for (i = 0; i < arr.length; i++) {
            arr[i].rumbo = course(lng, lat, arr[i].lng, arr[i].lat);
            //arr[i].distancia = loxDistance(lng, lat, arr[i].lng, arr[i].lat);
            $("#locations").append("<span id='r" + i + "' class='location'>" + arr[i].nameSpa + " " + Math.trunc(arr[i].rumbo) + "°</span>");
        }
    }
}

function course(lng1, lat1, lng2, lat2) {
    var incL = lng2 - lng1;

    if (incL == 0.0) {
        if (lat1 < lat2) {
            return 0.0;
        } else if (lat1 > lat2) {
            return 180.0;
        } else {
            return 0.0;
        }
    }

    var incLat = lat2 - lat1;
    if (incLat == 0.0) {
        if (lng1 < lng2) {
            return 90.0;
        } else if (lng1 > lng2) {
            return 270.0;
        } else {
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
    } else {
        if (Apradians > 0) {
            R = 180.0 + R;
        } else {
            R = 360.0 + R;
        }
    }
    return R;
}

function loxDistance(lng1, lat1, lng2, lat2) {
    var incL = (lng2 - lng1) * Math.PI / 180.0;
    var lm = (lat1 + lat2) / 2.0 * Math.PI / 180.0;
    var A = incL * Math.cos(lm);
    var inclat = (lat2 - lat1) * Math.PI / 180.0;
    var D = Math.sqrt(A * A + inclat * inclat);
    var distmillas = D * 180.0 / Math.PI * 60.0;
    var distmeters = distmillas * 1609.34;
    return distmeters;
}

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}

function gotDevices(deviceInfos) {
    var countVidDev = 0;
    for (var i = 0; i !== deviceInfos.length; ++i) {
        var deviceInfo = deviceInfos[i];
        if (deviceInfo.kind === 'videoinput') {
            idDevices.push(deviceInfo.deviceId);
            countVidDev++;
        }
    }
    if (countVidDev > 1) {
        $("#imgSwitch").click(function () {
            if (currentDevice == 0) { currentDevice = 1 } else { currentDevice = 0 };
            startDevice();
        });
        $("#imgSwitch").show();
    }
    if (navigator.userAgent.indexOf("Chrome") != -1) {
        currentDevice = 1;
    } else {
        currentDevice = 0;
    }
    startDevice();
}

function gotStream(stream) {
    window.stream = stream;
    video.srcObject = stream;
    return navigator.mediaDevices.enumerateDevices();
}

function startDevice() {
    var widthV, heightV;
    stopCamera();

    widthV = 720;
    heightV = 1280;
    var constraints = {
        audio: false,
        video: { deviceId:  idDevices[currentDevice] ? { exact: idDevices[currentDevice] } : undefined,    width: { min: 240, ideal: 480, max: 720 }, height: { min: 320, ideal: 640, max: 1280 } }
        //video: { deviceId: idDevices[currentDevice] ? { exact: idDevices[currentDevice] } : undefined, width: { ideal: widthV }, height: { ideal: heightV } }
    };
    navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
}

function handleError(error) {
    if (error.name === "ConstraintNotSatisfiedError") {
        errorMsg("La resolucion " + constraints.video.width.exact + "x" +
                constraints.video.width.exact + " px no esta soportada por su dispositivo.");
    }
    else if (error.name === "PermissionDeniedError") {
        errorMsg("No se han concedido permisos para usar tu cámara y " +
             "Micrófono, debe permitir que la página acceda a sus dispositivos.");
    }
    errorMsg("getUserMedia error: " + error.name, error);
}

function errorMsg(msg, error) {
    var errorElement = document.getElementById("errorMsg");
    errorElement.innerHTML += "<p>" + msg + "</p>";
    if (typeof error !== "undefined") {
        console.log(error);
    }
}

function handleOrientation(event) {
    var alpha, absolute;
    var rango = 15;
    var angDerecho, angIzquierdo, absoluto, i;

    if (event.alpha != null) {
        if (!startCamera) {
            startCamera = true;
            navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
        }

        if (event.webkitCompassHeading) {
            absolute = true;
            alpha = Math.trunc(event.webkitCompassHeading);
        } else {
            absolute = event.absolute;
            alpha = Math.trunc(Math.abs(360 - event.alpha));
        }

        angDerecho = alpha + rango;
        if (angDerecho > 360) {
            angDerecho = angDerecho - 360;
        }

        angIzquierdo = alpha - rango;
        if (angIzquierdo < 0) {
            angIzquierdo = 360 + angIzquierdo;
        }

        setCompass(alpha);
        //document.getElementById("errorMsg").innerHTML = "l:" + angIzquierdo + " c:" + alpha + " r:" + angDerecho; //+ " absoluto:" + absolute;

        if (arr) {
            for (i = 0; i < arr.length; i++) {
                    var angDerechoA = angDerecho;
                    if (angIzquierdo > angDerecho && (angDerecho - arr[i].rumbo) < 0) {
                        angDerechoA += 360;
                    }
                    var left = (((rango * 2) - (angDerechoA - arr[i].rumbo)) * window.innerWidth) / (rango * 2);
                    $("#r" + i).css("left", left);
                    if (i % 2 == 0) {
                        $("#r" + i).css("top", (window.innerHeight / 2) - $("#r" + i).height());
                    } else {
                        $("#r" + i).css("top", (window.innerHeight / 2) + $("#r" + i).height());
                    }
            }
        }
    } else {
        window.removeEventListener("devicemotion", handleMotion, true);
        window.removeEventListener("deviceorientationabsolute", handleOrientation, true);
        window.removeEventListener("deviceorientation", handleOrientation, true);
        errorMsg("Tu dispotivo no cuenta con magnetómetro");
    }
}

function stopCamera() {
    if (window.stream) {
        window.stream.getTracks().forEach(function (track) {
            track.stop();
        });
    }
    if (video.srcObject) {
        video.srcObject = null;
    }
}

function handleMotion(event) {
    var aZ = event.accelerationIncludingGravity.z;
    if (aZ) {
        aZ = Math.ceil(aZ);
        //document.getElementById("errorMsg").innerHTML = "-------------aZ: " + aZ;
        if (aZ <= 0) {
            $("#imgState").attr('src', imgUp.src);
            if ($("#imgState").css('display') == "none") { $("#imgState").fadeIn("fast"); }
        }
        else if (aZ > 6) {
            $("#imgState").attr('src', imgDown.src);
            if ($("#imgState").css('display') == "none") { $("#imgState").fadeIn("fast"); }
        } else {
            if ($("#imgState").css('display') != "none") { $("#imgState").hide(); }
        }
    }
}

function clearCanvas() {
    Context.clearRect(0, 0, CanvasObj.width, CanvasObj.height);
}

function setCompass(degrees) {
    clearCanvas();
    Context.drawImage(imgCom, 0, 0);
    Context.save();
    Context.translate(25, 25);
    Context.rotate(degrees * (Math.PI / 180));
    Context.drawImage(imgNeedle, -25, -25);
    Context.restore();
}

$(window).resize(function () {
    if (Context) {
        video.setAttribute("height", window.innerHeight);
        video.setAttribute("width", window.innerWidth);
    }
});
