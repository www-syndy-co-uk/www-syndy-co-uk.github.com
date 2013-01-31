define(["jquery"], function (jQuery) {

var $ = jQuery;

/**
 * Makes a jQuery ajax (as JSONP).
 */
function ajax(url, settings) {
    url += (url.indexOf("?") > -1) ? "&" : "?";
    url += "callback=";
    url += "?";
    return $.getJSON(url, settings).pipe(function (data) {
        return ("string" === typeof data) ? JSON.parse(data) : data;
    });
}

/**
 * The loadXXX methods load data, and returns a jQuery Deferred.
 * This Deferred can be used to attach other event handlers
 * to the Ajax request.
 */
function OddsService(host, port) {
    var me = this;

    host = host || "//api.syndy.co.uk";
    port = port || "";
    if (port) {
        host = host + ":" + port;
    }

    this.matches = [];
    this.match = null;
    this.matchSummaries = null;

    this.loadMatches = function () {
        var url = host + "/odds/matches";
        return ajax(url).done(function (data) {
            me.matches = data;
        });
    };

    this.loadMatch = function (matchId) {
        var url = host + "/odds/matches?matchId=" + matchId;
        return ajax(url).done(function (data) {
            me.match = data;
            me.matches.push(data);
        });
    };

    this.loadMatchSummaries = function () {
        var url = host + "/odds/matchSummaries";
        return ajax(url).done(function (data) {
            me.matchSummaries = data;
        });
    };
}

return OddsService;

});
