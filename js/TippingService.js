/*global window, alert*/
define(["jquery", "TipsModel"], function(jQuery, TipsModel) {

    var $ = jQuery;

    function TippingService(opts) {
        var me = this;

        var host = opts.host || "//api.syndy.co.uk";
        var port = opts.port || "";
        if (port) {
            host = host + ":" + port;
        }

        /**
         * Returns the current tip of the user.
         * @return {{tip: {id: String, tipRound: String, tipper: String, tips: String[], whenMade: number}}}
         */
        this.getCurrentTip = function() {
            var url = host + "/tipping/getCurrentTip";
            url += "?callback=?";
            return $.getJSON(url);
        };

        /**
         * @param {String} tipRound
         * @param {String[]} tips
         */
        this.makeTip = function(tipRound, tips) {
            var url = host + "/tipping/makeTip";
            url += "?callback=?";
            var data = {
                tipRound: tipRound,
                tips: tips
            };
            var settings = {
                data: data,
                dataType: "json",
                traditional: true
            };
            return $.ajax(url, settings).pipe(function(data) {
                return data;
            });
        };
    }

    TippingService.createTips = function(tip) {
        var result = [];
        if (!tip) {
            return result;
        }
        var tipper = tip.tipper;
        var tips = tip.tips;
        var hcaps = tip.hcaps;
        var odds = tip.odds;
        for (var i = 0; i < tips.length; i++) {
            result.push(new TipsModel.Tip(tips[i], hcaps[i], odds[i]));
        }
        return result;
    };

    return TippingService;

});