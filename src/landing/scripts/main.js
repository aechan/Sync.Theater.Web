'use strict';


$(function () {
    $('a[href*=#]').on('click', function (e) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: $($(this).attr('href')).offset().top }, 500, 'swing');
    });
});

window.onload = function () {
    $(".v-wrap").hide();
    $(".v-wrap").show("fade", 1000);
};

var timerid;
$("#roomCode").on("input", function (e) {
    $(this).val($(this).val().toUpperCase());
    var value = $(this).val();

    if ($(this).data("lastval") != value) {

        $(this).data("lastval", value);
        clearTimeout(timerid);

        timerid = setTimeout(function () {
            //change action
            value = value.toUpperCase();
            $.ajax({
                url: "http://" + window.location.hostname +"/roomcodeVer",
                headers: { "x-verify-roomcode": value },
                statusCode: {
                    200: function (data, textStatus, request) {
                        
                        if (request.getResponseHeader('x-verify-roomcode') === "exists") {
                            $("#icon").removeClass("fa-times-circle-o");
                            $("#icon").removeClass("red");
                            $("#icon").addClass("fa-check");
                            $("#icon").addClass("green");
                            console.log(request.responseText);
                            window.location = "http://" + window.location.hostname+"/"+request.responseText;
                        }
                        else if (request.getResponseHeader('x-verify-roomcode') === "does not exist") {
                            $("#icon").addClass("fa-times-circle-o");
                            $("#icon").addClass("red");
                            $("#icon").removeClass("fa-check");
                            $("#icon").removeClass("green");
                        }
                    }
                }
                

            });
        }, 500);
    };
});