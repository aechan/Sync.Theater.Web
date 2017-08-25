var UserStatus = {
    WATCHING: 0,
    BUFFERING: 1
}

var User = {
    Nickname: "",
    Status: UserStatus.WATCHING,

	changeNickname: function (nick) {
        this.Nickname = nick;

        UserTable.updateView();
    },

    Userlist: [],

    parseMessageForAt: function (message, sender) {
        var words = message.split(" ");
        for (var i = 0; i < words.length; i++) {
            if (words[i].indexOf("@") == 0) {
                if (words[i].substring(1).toUpperCase() === this.Nickname.toUpperCase()) {
                    $.growl({ title: "@"+sender, message: message, style: "notice" });
                }
            }
        }
        
    }
};



var UserTable = {
    updateView: function (userListJSON) {
        var userControlPanel = function (nn) {
            return (SyncPermissionsManager.permissionLevel === UserPermissionLevel.OWNER) ? '<td><a id="removeUser" href="#remove" data-name="' + nn + '"><i class="fa fa-times"></i></a>  |  <a id="upgradeUser" data-name="' + nn + '" href="#upgrade-user"><i class="fa fa-thumbs-up"></i></a>  |  <a id="downgradeUser" data-name="' + nn +'" href="#downgrade-user"><i class="fa fa-thumbs-down"></i></a></td>' : '<td></td>';
        };
        var status = function (st) {
            if (st === UserStatus.BUFFERING) {
                return '<i class="fa fa-spinner fa-lg" aria-hidden="true"></i>';
            } else if (st === UserStatus.WATCHING) {
                return '<i class="fa fa-play fa-lg" aria-hidden="true"></i>';
            }
        };
        User.Userlist = userListJSON.Userlist;
        $("#user-body").html("");
        $("#users-link").html("<i class='fa fa-user fa-lg'></i> - " + userListJSON.Userlist.length + " online");
        for (var i = 0; i < userListJSON.Userlist.length; i++) {
            if (userListJSON.Userlist[i].Nickname != User.Nickname) {
                $("#user-body").append('<tr>\
                <td>'+ userListJSON.Userlist[i].Nickname + '</span></td>\
                <td> '+ status(userListJSON.Userlist[i].Status) +'</td>\
                <td>'+ levelString(userListJSON.Userlist[i].PermissionLevel) + '</td>\
                '+ userControlPanel(userListJSON.Userlist[i].Nickname) + '</tr>');

                //add <a> event handlers
                $('#removeUser').click(function (e) {
                    e.preventDefault();
                    SocketCommandManager.kickUser($(this).attr("data-name"));
                });

                $('#upgradeUser').click(function (e) {
                    e.preventDefault();
                    SocketCommandManager.promoteUser($(this).attr("data-name"));
                });

                $('#downgradeUser').click(function (e) {
                    e.preventDefault();
                    SocketCommandManager.demoteUser($(this).attr("data-name"));
                });

            } else {
                $("#user-body").append('<tr>\
                <td class="selfNickname">'+ userListJSON.Userlist[i].Nickname + '</td>\
                <td> '+ status(userListJSON.Userlist[i].Status) +'</td>\
                <td>'+ levelString(userListJSON.Userlist[i].PermissionLevel) + '</td>\
                <td></td>\</tr>');

                //add <a> event handlers
            }
        }
    }
}
