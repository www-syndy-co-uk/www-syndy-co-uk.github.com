define(["jquery"], function (jQuery) {

var $ = jQuery;

function FixturesService(host, port) {
    var me = this;

    host = host || "//api.syndy.co.uk";
    port = port || "";
    if (port) {
        host = host + ":" + port;
    }

    this.data = null;
    this.fixtures = null;
    this.rounds = null;
    this.teams = null;

    function getRoundsFromFixtures(fixtures) {
        var rounds = [];
        for (var i = 0; i < fixtures.length; i++) {
            var f = fixtures[i];
            var roundIdx = parseInt(f.round, 10);
            var round = [];
            if (!isNaN(roundIdx)) {
                roundIdx -= 1;
                while (rounds.length <= roundIdx) {
                    rounds.push([]);
                }
                round = rounds[roundIdx];
            }
            round.push(f);
        }
        return rounds;
    }

    /**
     * Loads the fixture data, and returns a jQuery Deferred.
     * This Deferred can be used to attach other event handlers
     * to the Ajax request.
     */
    this.load = function (params) {
        var s = "";
        if (params) {
            s = ("string" !== typeof params) ? $.param(params) : params;
            s += "&";
        }
        s += "callback=?";
        var url = host + "/fixtures/slim?" + s;
        return $.getJSON(url).done(function (data) {
            data.rounds = getRoundsFromFixtures(data.fixtures);
        }).fail(function (response, status, xhr) {
            if (status !== "error") {
                return;
            }
            var arr = [href].concat(Array.prototype.slice.call(arguments));
            alert(arr.join("\n"));
        });
    };
}

return FixturesService;

});
