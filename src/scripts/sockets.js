var path = window.location.pathname;

var href = window.location.href;

var socket = connect();

var reconnect_attempts = 0;

function connect() {
    var ws = new WebSocket('ws://' + window.location.hostname + path);

    ws.onmessage = function (e) {
        //console.log(e.data);
        interpretMessage(JSON.parse(e.data));
    };

    ws.onclose = function (e) {
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
        $.growl({ style: 'error', title: 'Connection Error!', size: 'large', location: 'tc', fixed: false, message: 'Your connection to the server has been interrupted. Attempting to reconnect!' });

        setTimeout(function () {
            if (reconnect_attempts < 4) {
                
                connect();
                
            }
            
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
    },

    kickUser: function (Nickname) {
        if (SyncPermissionsManager.permissionLevel == UserPermissionLevel.OWNER) {
            socket.send(JSON.stringify({
                CommandType: CommandType.KICKUSER,
                TargetNickname: Nickname
            }));
        }
    },

    promoteUser: function (Nickname) {
        if (SyncPermissionsManager.permissionLevel == UserPermissionLevel.OWNER) {
            socket.send(JSON.stringify({
                CommandType: CommandType.UPGRADEUSERPERMISSIONS,
                Upgrade: true,
                TargetNickname: Nickname
            }));
        }
    },

    demoteUser: function (Nickname) {
        if (SyncPermissionsManager.permissionLevel == UserPermissionLevel.OWNER) {
            socket.send(JSON.stringify({
                CommandType: CommandType.UPGRADEUSERPERMISSIONS,
                TargetNickname: Nickname,
                Upgrade: false
            }));
        }
    },

    refreshUserList: function () {
        socket.send(JSON.stringify({
            CommandType: CommandType.SENDUSERLIST
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

    if (obj.CommandType == CommandType.KICKUSER) {
        $.growl({ style: 'error', title: 'Sorry!', size: 'large', location: 'tc', fixed: true, message: 'You have been kicked by the room owner :(' });
        connect = null;
    }
};

$("#like-btn").click(function (event) {
    event.preventDefault();
    socket.send(JSON.stringify({
        CommandType: CommandType.ADDLIKE
    }));
});

$("#users-link").click(function (e) {
    $('html, body').animate({
        scrollTop: $("#users").offset().top
    }, 2000);
    return false;
});
var CommandType = {
        // User management commands
    REGISTERUSER: "REGISTERUSER",
    LOGINUSER: "LOGINUSER",
    UPGRADEUSERPERMISSIONS: "UPGRADEUSERPERMISSIONS",
    PERMISSIONSCHANGEDNOTIFICATION: "PERMISSIONSCHANGEDNOTIFICATION",
        // Queue commands
    MODIFYQUEUE: "MODIFYQUEUE",
    ADDQUEUE: "ADDQUEUE",
    DELETEQUEUE: "DELETEQUEUE",
    GETALL: "GETALL",
    GETONE: "GETONE",

        // Video controls
    SYNCSTATE: "SYNCSTATE",

    QUEUEUPDATE: "QUEUEUPDATE",
    SETUSERNICKNAME: "SETUSERNICKNAME",
    SENDUSERLIST: "SENDUSERLIST",

    ADDLIKE: "ADDLIKE",
    UPDATELIKES: "UPDATELIKES",
    CHAT: "CHAT",
    KICKUSER: "KICKUSER"
};
