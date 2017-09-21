var OnboardManager = {
    returningUserCookie: "HasBeenHereBefore",

    checkNewUser: function(){
        if(CookieManager.getCookie(this.returningUserCookie) !== ""){
            return false;
        } else{
            CookieManager.setCookie(this.returningUserCookie, "has", 365);
            return true;
        }
    },

    beginOnboarding: function(){
        if(this.checkNewUser()){
            introJs().setOption("overlayOpacity", 0);

            introJs().start();
        }
    }

};