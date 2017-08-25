var video = videojs('video');

video.on('pause', function () {
    SocketCommandManager.syncState(video.currentTime(), video.paused());
});

video.on('play', function () {
    SocketCommandManager.syncState(video.currentTime(), video.paused());
});

video.on('seeked', function () {
    SocketCommandManager.syncState(video.currentTime(), video.paused());
});

video.on('timeupdate', function () {
    SocketCommandManager.syncState(video.currentTime(), video.paused());
});

video.on("waiting", function () {
    User.Status = UserStatus.BUFFERING;
    SocketCommandManager.sendStatusUpdate(User.Status);
});

video.on('playing', function () {
    User.Status = UserStatus.WATCHING;
    SocketCommandManager.sendStatusUpdate(User.Status);
});




var VideoManager = {
    setState: function (time, paused) {
        if (paused) {
            video.pause();
        }
        else {
            video.play();
        }
        if ( Math.abs(video.currentTime() - time) > 0.3 ) {
            video.currentTime(time);
        }
    }
};