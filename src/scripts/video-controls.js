var video = videojs('video');

video.on('pause', function () {
    SocketCommandManager.syncState(video.currentTime, video.paused);
});

video.on('play', function () {
    SocketCommandManager.syncState(video.currentTime, video.paused);

});

video.on('seeked', function () {
    SocketCommandManager.syncState(video.currentTime, video.paused);

});

video.on('timeupdate', function () {
    SocketCommandManager.syncState(video.currentTime, video.paused);

});

var VideoManager = {
    setState: function (time, paused) {
        video.currentTime = time;
        if (paused) {
            video.pause();
        }
        else {
            video.play();
        }
    }
};