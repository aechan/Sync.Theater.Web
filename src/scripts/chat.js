var Chat = {

    addMessage: function (message, sender) {
        var align = '';
        var self = (sender.toUpperCase() === User.Nickname.toUpperCase());
        if (self) {
            align = 'my-chat';
        }
        else {
            align = 'your-chat';
            User.parseMessageForAt(message, sender);
        }
        $("#chatArea").append('\
            <div class="wordwrap talk-bubble '+align+'">\
					<a href="#at" username="'+sender+'"class="sender">'+sender+'</a>: <span style="color: white">'+message+'</span>\
            </div>');
            $("a.sender").click(function (e){
                
                $("#messageBox").val("@"+$(this).attr("username")+" ");
                $("#messageBox").focus();
                return false;
            });
        
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