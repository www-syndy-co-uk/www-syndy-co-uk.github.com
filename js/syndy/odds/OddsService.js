define([
    "jquery",
    "underscore",
    "q",
    "syndy/ajax",
    "syndy/promise/utils"
], function($, _, Q, ajax, promiseUtils) {

    function trueFilter() {
        return true;
    }

    /**
     * The loadXXX methods load data, and returns a jQuery Deferred.
     * This Deferred can be used to attach other event handlers
     * to the Ajax request.
     */
    function OddsService(opts) {
        // make copy
        opts = _.extend({}, opts);
        this.opts = opts;

        opts.host = opts.host || "//api.syndy.co.uk";
        opts.port = opts.port || "";

        if (opts.port) {
            opts.host = opts.host + ":" + opts.port;
        }
    }

    OddsService.prototype.loadMatches = function() {
        var url = this.opts.host + "/odds/matches";
        return ajax.getJSON(url);
    };

    OddsService.prototype.loadMatch = function(matchId) {
        var url = this.opts.host + "/odds/matches?matchId=" + matchId;
        return ajax.getJSON(url);
    };

    OddsService.prototype.loadMatchSummaries = function() {
        var url = this.opts.host + "/odds/matchSummaries";
        return ajax.getJSON(url);
    };

    OddsService.prototype.loadSummariesThenMatches = function(matchFilter) {
        var self = this;

        matchFilter = matchFilter || trueFilter;

        return this.loadMatchSummaries().then(function(response) {
            var matchSummaries = _.filter(response, matchFilter);

            var promises = _.map(matchSummaries, function(matchSummary, i) {
                return self.loadMatch(matchSummary.id);
            });

            return promiseUtils.allSettledAndNotify(promises).then(function(list) {
                return {
                    matchSummaries: matchSummaries,
                    matches: list
                };
            });
        });
    };

    return OddsService;

});
