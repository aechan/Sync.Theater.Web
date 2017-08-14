var Queue = {

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

            this.rebuildQueueView();
        }
    },

    rebuildQueueView: function () {
        $("#queue-body").html("");
        for (key in this.currentQueue.URLItems) {
            $("#queue-body").append('<tr id="' + key +'">\
                <td> <i class="fa fa-bars"></i></td>\
                <td><a href="#play" id='+ key + '_play' +'>'+ Queue.currentQueue.URLItems[key].URL +'</a></td>\
                <td><a id="'+ key + '_remove' +'" href="#remove"><i class="fa fa-times"></i></a></td>\
				</tr >');

            $("#" + key + "_remove").click(function () {
                Queue.removeFromQueue(($(this).attr('id').replace("_remove", "")));
            });

            $("#" + key + "_play").click(function () {
                Queue.playItem(($(this).attr('id').replace("_play", "")));
            });
        }
    },

    removeFromQueue: function (key) {
        delete this.currentQueue.URLItems[key];

        this.rebuildQueueView();
    },

    sortQueue: function (sortedData) {
        console.log(sortedData);

        var URLArr = sortedData.split("&");

		// set new indices for URLItems
        for (var i = 0; i < URLArr.length; i++){
            var key = URLArr[i].replace("=", "_");

            this.currentQueue.URLItems[key].index = i;
        }
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

        return JSON.stringify(queue);
    },

	// builds queue from json recieved from server
    buildQueueFromJSON: function (jsonObj) {
        this.currentQueue.Name = jsonObj.Name;
        this.currentQueue.QueueIndex = jsonObj.QueueIndex;
        this.currentQueue.URLItems = {};

        for (var i = 0; i < jsonObj.URLs.length; i++) {
            this.addToQueue(jsonObj.URLs[i]);
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

        video.src({
            type: "application/x-mpegURL",
            src: this.currentQueue.URLItems[key].URL
        });
        video.play();
    },
    


    buildTestQueue: function () {
        this.addToQueue("https://www.youtube.com/watch?v=asdf");
        this.addToQueue("https://www.youtube.com/watch?v=ggagsdg");
        
    }
};



var MIMEUtils = {
	// Return the first few bytes of the file as a hex string
	getBLOBFileHeader: function(url, blob, callback) {
		var fileReader = new FileReader();
		fileReader.onloadend = function (e) {
			var arr = (new Uint8Array(e.target.result)).subarray(0, 4);
			var header = "";
			for (var i = 0; i < arr.length; i++) {
				header += arr[i].toString(16);
			}
			callback(url, header);
		};
		fileReader.readAsArrayBuffer(blob);
    },

    remoteCallback: function (url, blob) {
        this.getBLOBFileHeader(url, blob, headerCallback);
    },

    mimeType: function (headerString) {
        var type = "";
        switch (headerString) {
            case "89504e47":
                type = "image/png";
                break;
            case "47494638":
                type = "image/gif";
                break;
            case "ffd8ffe0":
            case "ffd8ffe1":
            case "ffd8ffe2":
                type = "image/jpeg";
                break;
            default:
                type = "unknown";
                break;
        }
        return type;
    },

    getRemoteFileHeader: function (url, callback) {
        var xhr = new XMLHttpRequest();
        // Bypass CORS for this demo - naughty, Drakes
        xhr.open('GET', '//cors-anywhere.herokuapp.com/' + url);
        xhr.responseType = "blob";
        xhr.onload = function () {
            callback(url, xhr.response);
        };
        xhr.onerror = function () {
            alert('A network error occurred!');
        };
        xhr.send();
    },

	headerCallback: function(url, headerString) {
        mimeType(headerString);
    },


    getMimeType: function(url) {
        getRemoteFileHeader(url, this.remoteCallback);
    }


}



$("#addToQueueBtn").click(function () {
    Queue.addToQueue($("#videoURL").val());
    $("#videoURL").val("");
});

$("#videoURL").keypress(function (e) {
    if (e.which == 13) {
        $("#addToQueueBtn").click();

    }
});