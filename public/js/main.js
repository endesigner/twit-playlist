var videos = [ ];
var pointer = -1; // Starting video index
var current_video;
var player; // Element containing swf object.

function createXHR() {
    var xhr;
    if (window.ActiveXObject) {
        try {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        } catch(e) {
            alert(e.message);
            xhr = null;
        }
    } else {
        xhr = new XMLHttpRequest();
    }

    return xhr;
}
var xhr = createXHR();
xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
        videos = JSON.parse(xhr.responseText);
        pointer = -1; // Reset
        loadNextVideo();
    }
}
function getList(screen_name) {
    xhr.open('GET', '/playlist?screen_name=' + screen_name, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send();
}


//Support function: checks to see if target
//element is an object or embed element
function isObject(targetID){
    var isFound = false;
    var el = document.getElementById(targetID);
    if(el && (el.nodeName === "OBJECT" || el.nodeName === "EMBED")){
        isFound = true;
    }
    return isFound;
}

//Support function: creates an empty
//element to replace embedded SWF object
function replaceSwfWithEmptyDiv(targetID){
    var el = document.getElementById(targetID);
    if(el){
        var div = document.createElement("div");
        el.parentNode.insertBefore(div, el);

        //Remove the SWF
        swfobject.removeSWF(targetID);

        //Give the new DIV the old element's ID
        div.setAttribute("id", targetID);
    }
}

function loadSWF(url, targetID) {
    //Check for existing SWF
    if(isObject(targetID)){
        //replace object/element with a new div
        replaceSwfWithEmptyDiv(targetID);
    }

    //Embed SWF
    if (swfobject.hasFlashPlayerVersion("9")) {
        var attributes = {
            data: url,
            width:"550",
            height:"400"
        };
        var params = { allowScriptAccess: "always" }; // Tell YT player to invoke a callback.
        var obj = swfobject.createSWF(attributes, params, targetID);
    }
}

function onYouTubePlayerReady(playerId) {
    player = document.getElementById("player");
    player.addEventListener("onStateChange", "onStateChange");
    player.addEventListener("onError", "onError");
}

function onStateChange(state) {
    console.log("Player's new state: " + state);
    if (state === 0) {
        loadNextVideo();
    }

    // Autoplay
    if (state === -1) {
        player.playVideo();
        console.log(player);
    }
}

// Just go to next video if current video gives us trouble
function onError(e) {
    loadNextVideo();
}
function loadNextVideo() {
    if (pointer > videos.length-2) {
        return;
    }
    current_video = videos[++pointer];
    load(current_video);
}
function loadPreviousVideo() {
    if (pointer <= 0) {
        return;
    }
    current_video = videos[--pointer];
    load(current_video);
}

function load(id) {
    loadSWF("http://www.youtube.com/v/" + id + "?enablejsapi=1&playerapiid=player&version=3", "player");
}

function init() {
    var previous = document.getElementById('btn-previous');
    previous.addEventListener('click', function(e){
        e.preventDefault();
        loadPreviousVideo();
    });

    var next = document.getElementById('btn-next');
    next.addEventListener('click', function(e){
        e.preventDefault();
        loadNextVideo();
    });

    var fetch = document.getElementById('fetch');
    fetch.addEventListener('click', function(e){
        e.preventDefault();
        var screen_name = document.getElementById('screen_name');
        getList(screen_name.value);
    });

}

window.onload = init();
