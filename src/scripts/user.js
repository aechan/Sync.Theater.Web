var User = {
    Nickname: "",

	changeNickname: function (nick) {
        this.Nickname = nick;

        UserTable.updateView();
    }
};

var UserTable = {
    updateView: function (userListJSON) {
        $("#user-body").html("");
        $("#users-link").html("<i class='fa fa-user fa-lg'></i> - " + userListJSON.Userlist.length + " online");
        for (var i = 0; i < userListJSON.Userlist.length; i++) {
            if (userListJSON.Userlist[i].Nickname != User.Nickname) {
                $("#user-body").append('<tr>\
                <td>'+ userListJSON.Userlist[i].Nickname + '</td>\
                <td>'+ levelString(userListJSON.Userlist[i].PermissionLevel) + '</td>\
                <td><a href="#remove"><i class="fa fa-times"></i></a>  |  <a href="#upgrade-user"><i class="fa fa-thumbs-up"></i></a>  |  <a href="#downgrade-user"><i class="fa fa-thumbs-down"></i></a></td>\</tr>');

                //add <a> event handlers

            } else {
                $("#user-body").append('<tr>\
                <td class="selfNickname">'+ userListJSON.Userlist[i].Nickname + '</td>\
                <td>'+ levelString(userListJSON.Userlist[i].PermissionLevel) + '</td>\
                <td></td>\</tr>');

                //add <a> event handlers
            }
        }
    }
}
