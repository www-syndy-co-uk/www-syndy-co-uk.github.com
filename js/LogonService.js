define(["jquery"], function (jQuery) {

var $ = jQuery;

function LogonService (apiRoot) {
    this.apiRoot = apiRoot;
}

LogonService.prototype.checkLoggedInStatus = function (destUrl) {
    destUrl = destUrl || "/";
    var url = this.apiRoot + "/authentication/loginInfo?destUrl=" + encodeURIComponent(destUrl);
    url += "&callback=?";
    return $.getJSON(url);
};

return LogonService;

});