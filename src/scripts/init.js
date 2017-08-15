window.onload = function () {
    $("#roomCode").val(window.location.href);

    setInterval(function () {
        SocketCommandManager.syncState(video.currentTime(), video.paused());
    }, 0.05);

    video.on('ended', function () {
        Queue.autoAdvanceQueue();
    });

};

