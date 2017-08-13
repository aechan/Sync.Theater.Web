window.onload = function () {
    $("#roomCode").text(window.location.href);
    setInterval(function () {
        SocketCommandManager.syncState(video.currentTime(), video.paused());
    }, 0.05);
};

