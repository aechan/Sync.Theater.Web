var Queue = {

    autoRestart: false,
    autoPlay: true,

    currentQueue: {
        Name: "",
        QueueIndex: 0,
		URLItems: {}
    },

    addToQueue: function (url) {
        if (this.validURL(url)) {

			// get count of urls before add
            var count = 0;
            for (key in this.currentQueue.URLItems) {
                count++;
            }

            var index = count;
			// add URLItem to model
            this.currentQueue.URLItems["url_" + index] = {};
            this.currentQueue.URLItems["url_" + index].URL = url;
            this.currentQueue.URLItems["url_" + index].index = index;

            SocketCommandManager.syncQueue(this.queueToJSON());

            if (video.currentSrc() === "" && index === 0) {
                Queue.playItem(Queue.urlItemKeyFromIndex(0));
            }

            this.rebuildQueueView();
        }
    },

    rebuildQueueView: function () {
        $("#queue-body").html("");

        if ($("#QueueName").val() != this.currentQueue.Name) {
            $("#QueueName").val(this.currentQueue.Name);
        }
        for (key in this.currentQueue.URLItems) {
            $("#queue-body").append('<tr id="' + key +'">\
                <td>  <i class="fa fa-bars"></i></td>\
                <td><a href="#play" id='+ key + '_play' +'> <i class="fa fa-play-circle" aria-hidden="true"></i> -- '+ Queue.currentQueue.URLItems[key].URL +'</a></td>\
                <td><a id="'+ key + '_remove' +'" href="#remove"><i class="fa fa-times"></i></a></td>\
				</tr >');

            $("#" + key + "_remove").click(function (event) {
                event.preventDefault();
                if (SyncPermissionsManager.permissionLevel === UserPermissionLevel.OWNER || SyncPermissionsManager.permissionLevel === UserPermissionLevel.TRUSTED) {
                    Queue.removeFromQueue(($(this).attr('id').replace("_remove", "")));
                }
            });

            $("#" + key + "_play").click(function (event) {
                event.preventDefault();
                if (SyncPermissionsManager.permissionLevel === UserPermissionLevel.OWNER || SyncPermissionsManager.permissionLevel === UserPermissionLevel.TRUSTED) {
                    Queue.playItem(($(this).attr('id').replace("_play", "")));
                }
            });
        }
    },

    removeFromQueue: function (key) {
        delete this.currentQueue.URLItems[key];

        SocketCommandManager.syncQueue(this.queueToJSON());

        this.rebuildQueueView();
    },

    sortQueue: function (sortedData) {
        var currentKey = this.urlItemKeyFromIndex(this.currentQueue.QueueIndex);

        var URLArr = sortedData.split("&");

		// set new indices for URLItems
        for (var i = 0; i < URLArr.length; i++){
            var key = URLArr[i].replace("=", "_");

            this.currentQueue.URLItems[key].index = i;
        }


		// change the queueindex to match the currently playing media
        this.currentQueue.QueueIndex = this.urlItemIndexFromKey(currentKey);

        SocketCommandManager.syncQueue(this.queueToJSON());
    },

    urlItemKeyFromIndex: function (index) {
        for (var key in this.currentQueue.URLItems) {
            if (this.currentQueue.URLItems[key].index === index) {
                return key;
            }
        }
    },

    urlItemIndexFromKey: function (key) {
        return this.currentQueue.URLItems[key].index;
    },

	// serializes our queue to json for updating the server
    queueToJSON: function () {
        var urls = [];

        for (var key in Queue.currentQueue.URLItems) {
            urls.splice(Queue.currentQueue.URLItems[key].index, 0, Queue.currentQueue.URLItems[key].URL);
        }

        var queue = {
            Name: Queue.currentQueue.Name,
            QueueIndex: Queue.currentQueue.QueueIndex,
            URLs: urls
        };

        return queue;
    },

	// builds queue from json recieved from server
    buildQueueFromJSON: function (jsonObj) {
        this.currentQueue.Name = jsonObj.Name;
        this.currentQueue.QueueIndex = jsonObj.QueueIndex;
        this.currentQueue.URLItems = {};

        for (var i = 0; i < jsonObj.URLs.length; i++) {
            this.addToQueue(jsonObj.URLs[i]);
        }

        for (var key in this.currentQueue.URLItems) {
            if (this.currentQueue.URLItems[key].index === this.currentQueue.QueueIndex) {
                this.playItem(key);
            }
        }


    },

	validURL: function (str) {
        var expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;

        var pattern = new RegExp(expression);
        if (!pattern.test(str)) {
            //alert("Please enter a valid URL.");
            return false;
        } else {
            return true;
        }
    },

    playItem: function (key) {
        this.currentQueue.QueueIndex = this.currentQueue.URLItems[key].index;

        if (~this.currentQueue.URLItems[key].URL.indexOf("youtu.be") || ~this.currentQueue.URLItems[key].URL.indexOf("youtube.com")) {

            video.src({
                type: "video/youtube",
                src: Queue.currentQueue.URLItems[key].URL
            });
            video.play();
            SocketCommandManager.syncQueue(Queue.queueToJSON());
        } else if (~this.currentQueue.URLItems[key].URL.endsWith(".webm")) {
            video.src({
                type: "video/webm",
                src: Queue.currentQueue.URLItems[key].URL
            });
            video.play();
            SocketCommandManager.syncQueue(Queue.queueToJSON());
        } else {
            video.src({
                type: "video/mp4",
                src: Queue.currentQueue.URLItems[key].URL
            });
            video.play();
            SocketCommandManager.syncQueue(Queue.queueToJSON());
        }

        
    },
    
    autoAdvanceQueue: function () {
        var url_key = "";
        for (var key in this.currentQueue.URLItems) {
            if (this.currentQueue.URLItems[key].index == this.currentQueue.QueueIndex + 1) {
                url_key = key;
            }
        }

        if (url_key === "") {
            if (Queue.autoRestart) {
                for (var key in this.currentQueue.URLItems) {
                    if (this.currentQueue.URLItems[key].index === 0) {
                        this.playItem(key);
                    }
                }
            }
            else {
                return;
            }
        }
        else {
            this.playItem(url_key);
        }

    }
};

$("#addToQueueBtn").click(function () {
    Queue.addToQueue($("#videoURL").val());
    $("#videoURL").val("");
});

$("#videoURL").keypress(function (e) {
    if (e.which == 13) {
        $("#addToQueueBtn").click();

    }
});

$("#QueueName").on("input", function (e) {
    if ($(this).data("lastval") != $(this).val()) {
        $(this).data("lastval", $(this).val());

        //change action
        Queue.currentQueue.Name = $(this).val();

		// sync it
        SocketCommandManager.syncQueue(Queue.queueToJSON());
    };
});