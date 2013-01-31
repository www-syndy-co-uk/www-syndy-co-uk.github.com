define(["jquery"], function (jQuery) {

var $ = jQuery;

function LogonService (apiRoot) {
    this.apiRoot = apiRoot;
}

LogonService.prototype.checkLoggedInStatus = function (postLoginUrl, postLogoutUrl) {
    postLoginUrl = postLoginUrl || "/";
    postLogoutUrl = postLogoutUrl || "/";
    var postLoginUrl = "/authentication/redirectToBlog?destUrl=" + postLoginUrl;
    var postLogoutUrl = "/authentication/redirectToBlog?destUrl=" + postLogoutUrl;
    var url = this.apiRoot + "/authentication/loginInfo?postLoginUrl=" + encodeURIComponent(postLoginUrl) + "&postLogoutUrl=" + encodeURIComponent(postLogoutUrl);
    url += "&callback=?";
    return $.getJSON(url);
};

return LogonService;

});