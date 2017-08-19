var path = window.location.pathname;

var href = window.location.href;

var socket = connect();


function connect() {
    var ws = new WebSocket('ws://' + window.location.hostname + path);

    ws.onmessage = function (e) {
        //console.log(e.data);
        interpretMessage(JSON.parse(e.data));
    };

    ws.onclose = function (e) {
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
        setTimeout(function () {
            connect();
        }, 1000);
    };

    ws.onerror = function (err) {
        console.error('Socket encountered error: ', err.message, 'Closing socket');
        ws.close();
    };

    return ws;
}




// manages sending messages to the server.
var SocketCommandManager = {
    // upgrade other user's permissions if owner
    upgradeUserPermissions: function(nickname, level){
        if(SyncPermissionsManager.permissionLevel==UserPermissionLevel.OWNER){
            socket.send(JSON.stringify({
                CommandType: CommandType.UPGRADEUSERPERMISSIONS,
                PermissionLevel: level,
                Target: nickname
            }));
        }
    },

    // forces others to sync to our video state if owner
    syncState: function(time, pauseState){
        if (SyncPermissionsManager.permissionLevel == UserPermissionLevel.OWNER ){//|| SyncPermissionsManager.permissionLevel == UserPermissionLevel.TRUSTED){
            socket.send(JSON.stringify({
                CommandType: CommandType.SYNCSTATE,
                Time: time,
                Paused: pauseState
            }));
        }
    },

    syncQueue: function (queueObj) {
        if (SyncPermissionsManager.permissionLevel == UserPermissionLevel.OWNER || SyncPermissionsManager.permissionLevel == UserPermissionLevel.TRUSTED) {
            socket.send(JSON.stringify({
                CommandType: CommandType.MODIFYQUEUE,
                Queue: queueObj
            }));
        }
    },

    sendChat: function (message, sender) {
        socket.send(JSON.stringify({
            CommandType: CommandType.CHAT,
            Sender: sender,
			Message: message
        }));
    }
};

// message interpreter
var interpretMessage = function(obj){
    if(obj.CommandType == CommandType.PERMISSIONSCHANGEDNOTIFICATION){
        SyncPermissionsManager.modifyPermissions(obj.PermissionLevel);
    }

    if (obj.CommandType == CommandType.SYNCSTATE && SyncPermissionsManager.permissionLevel != UserPermissionLevel.OWNER) {
        VideoManager.setState(obj.State.Time, obj.State.Paused);
    }

    if (obj.CommandType == CommandType.QUEUEUPDATE) {
        Queue.buildQueueFromJSON(obj.Queue);
    }

    if (obj.CommandType == CommandType.SENDUSERLIST) {
        UserTable.updateView(obj);
    }

    if (obj.CommandType == CommandType.SETUSERNICKNAME) {
        User.changeNickname(obj.Nickname);
    }

    if (obj.CommandType == CommandType.UPDATELIKES) {
        $("#likeCount").html(obj.Likes);

        var hearts = Math.random() * 6;

        //for (var i = 0; i < hearts; i++) {
            var b = Math.floor((Math.random() * 100) + 1);
            var d = ["flowOne", "flowTwo", "flowThree"];
            var a = ["colOne", "colTwo", "colThree", "colFour", "colFive", "colSix"];
            var c = (Math.random() * (1.6 - 1.2) + 1.2).toFixed(1);
            $('<div class="heart part-' + b + " " + a[Math.floor((Math.random() * 6))] + '" style="font-size:' + Math.floor(Math.random() * (50 - 22) + 22) + 'px;"><i class="fa fa-heart"></i></div>').appendTo(".hearts").css({
                animation: "" + d[Math.floor((Math.random() * 3))] + " " + c + "s linear"
            });
            $(".part-" + b).show();
            setTimeout(function () {
                $(".part-" + b).remove()
            }, c * 900)
        //}
    }

    if (obj.CommandType == CommandType.CHAT) {
        Chat.addMessage(obj.Message, obj.Sender);
    }
};

$("#like-btn").click(function (event) {
    event.preventDefault();
    socket.send(JSON.stringify({
        CommandType: CommandType.ADDLIKE
    }));
});

var CommandType = {
        // User management commands
        REGISTERUSER : 0,
        LOGINUSER : 1,
        UPGRADEUSERPERMISSIONS : 2,
        PERMISSIONSCHANGEDNOTIFICATION : 3,
        // Queue commands
        MODIFYQUEUE : 4,
        ADDQUEUE : 5,
        DELETEQUEUE : 6,
        GETALL : 7,
        GETONE : 8,

        // Video controls
        SYNCSTATE: 9,

        QUEUEUPDATE: 10,
        SETUSERNICKNAME: 11,
        SENDUSERLIST: 12,

        ADDLIKE: 13,
        UPDATELIKES: 14,
		CHAT: 15
};
