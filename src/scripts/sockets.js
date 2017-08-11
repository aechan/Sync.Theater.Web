var path = window.location.pathname;

var href = window.location.href;
var socket = new WebSocket('ws://' + window.location.hostname + ':8080' + path);

socket.onmessage = function (e) {
    interpretMessage(JSON.parse(e.data));
};

socket.onopen = function(e){

};

socket.onclose = function(e){
    // retry connection

    //setInterval(function () {
      //  if (socket.readyState == )
    //}, 500);
};


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
        if(SyncPermissionsManager.permissionLevel == UserPermissionLevel.OWNER ||
            SyncPermissionsManager.permissionLevel == UserPermissionLevel.TRUSTED){
            socket.send(JSON.stringify({
                CommandType: CommandType.SYNCSTATE,
                Time: time,
                PauseState: pauseState
            }));
        }
    }
};

// message interpreter
var interpretMessage = function(obj){
    if(obj.CommandType == CommandType.PERMISSIONSCHANGEDNOTIFICATION){
        SyncPermissionsManager.modifyPermissions(obj.PermissionLevel);
    }

    if (obj.CommandType == CommandType.SYNCSTATE && SyncPermissionsManager.permissionLevel != UserPermissionLevel.OWNER) {
        VideoManager.setState(obj.State.Time, obj.State.Time);
    }
};


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
        SYNCSTATE : 9
};
