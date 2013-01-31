define(["jquery"], function (jQuery) {

var $ = jQuery;

function LogonService (apiRoot) {
    this.apiRoot = apiRoot;
}

LogonService.prototype.checkLoggedInStatus = function (destUrl) {
    destUrl = destUrl || "/";
    var internalRedirectUrl = "/authentication/redirectToBlog?destUrl=" + destUrl;
    var url = this.apiRoot + "/authentication/loginInfo?destUrl=" + encodeURIComponent(internalRedirectUrl);
    url += "&callback=?";
    return $.getJSON(url);
};

return LogonService;

});