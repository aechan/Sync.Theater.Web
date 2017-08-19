var Chat = {

    addMessage: function (message, sender) {
        var align = '';
        var self = (sender.toUpperCase() === User.Nickname.toUpperCase());
        if (self) {
            align = 'right-in';
        }
        else {
            align = 'left-in';
            User.parseMessageForAt(message, sender);
        }
        $("#chatArea").append('\
            <div class="talk-bubble round tri-right '+align+'">\
				<div class="talktext" >\
					<p>'+sender+': '+message+'</p>\
				</div>\
			</div>');
        
    },

    sendChat: function (message) {
        SocketCommandManager.sendChat(message, User.Nickname);
    }

};

$("#messageBox").keypress(function (e) {
    if (e.which == 13) {
        Chat.sendChat($("#messageBox").val());
        $("#messageBox").val("");
    }
});