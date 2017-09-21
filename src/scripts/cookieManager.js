var CookieManager = {
    setCookie: function(name, value, exdays) {
        var d, expires;
        exdays = exdays || 1;
        d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + "; " + expires;
    },

    getCookie: function(name){
        var cookie, c;
        cookies = document.cookie.split(';');
        for (var i=0; i < cookies.length; i++) {
            c = cookies[i].split('=');
            if (c[0] == name) {
                return c[1];
            }
        }
        return "";
    },

    deleteCookie: function(name){
        this.setCookie('name', '', -1);
    }

};