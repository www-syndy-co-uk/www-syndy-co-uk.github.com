// Globals:
//   Adds syndy.loginInfo object

define(["jquery", "LogonService"], function ($, LogonService) {
    var $loginInfo = $(".login-info");
    var $loginBtn = $loginInfo.find("button.login");
    var $logoutBtn = $loginInfo.find("button.logout");
    var loginInfo = null;
    var logonService = new LogonService(syndy.apiRoot);

    var $throbber = $loginInfo.find(".throbber");
    $throbber.show();

    $loginInfo.on("click", "button.login", function (evt) {
        var loginUrl = loginInfo.loginUrl;
        if (loginUrl.indexOf("http") !== 0) {
            loginUrl = syndy.apiRoot + loginUrl;
        }
        window.location.href = loginUrl;
    });

    $loginInfo.on("click", "button.logout", function (evt) {
        var logoutUrl = loginInfo.logoutUrl;
        if (logoutUrl.indexOf("http") !== 0) {
            logoutUrl = syndy.apiRoot + logoutUrl;
        }
        window.location.href = logoutUrl;
    });

    var postLoginUrl = window.location.pathname;
    var postLogoutUrl = window.location.pathname;
    logonService.checkLoggedInStatus(postLoginUrl, postLogoutUrl).done(function (data) {
        $throbber.hide();

        loginInfo = data;

        // set global
        syndy.loginInfo = data;

        if (loginInfo.isUserLoggedIn) {
            var admin = loginInfo.isUserAdmin ? "[A]" : "";
            $loginInfo.find("span").html(loginInfo.user.nickname + " " + admin).show();
            $logoutBtn.show();
        } else {
            $loginBtn.show();
        }
    });
});
