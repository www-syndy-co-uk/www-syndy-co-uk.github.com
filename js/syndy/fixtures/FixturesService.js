/*global window, alert*/
define(["jquery"], function ($) {

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

    function resolveTeam(team, teams) {
        if (!teams) {
            return team;
        }
        return teams[team];
    }

    /**
     * Create a map of [team name/string] -> [team id/int].
     */
    function createTeamIds(fixtures, teams) {
        // Keep a team id Map for adding id attrs to team elements
        var teamIds = {};
        var teamIdCount = 0;
        _.each(fixtures, function(fixture, fixtureIdx) {
            var team1 = resolveTeam(fixture.teamId1, teams);
            var team2 = resolveTeam(fixture.teamId2, teams);
            // ids are used for clicks
            var teamId1 = teamIds[team1];
            if ("undefined" === typeof teamId1) {
                teamId1 = teamIds[team1] = teamIdCount++;
            }
            var teamId2 = teamIds[team2];
            if ("undefined" === typeof teamId2) {
                teamId2 = teamIds[team2] = teamIdCount++;
            }
        });
        console.log(teamIds);
        return teamIds;
    }

    function handleData(data) {
        var d = {};
        // slim fixtures (smaller json) have data.fixtures. regular fixtures do not.
        var fixtures = data.fixtures ? data.fixtures : data;
        d.rounds = getRoundsFromFixtures(fixtures);
        d.fixtures = fixtures;
        d.teams = data.teams || [];
        return d;
    }

    function FixturesService(opts) {
        opts = opts || {};
        this.opts = opts;

        opts.host = opts.host || "//api.syndy.co.uk";
        opts.port = opts.port || "";
        opts.slim = opts.slim || false;
        opts.path = opts.path || (opts.slim ? "/fixtures/slim" : "/fixtures");
        if (opts.port) {
            opts.host = opts.host + ":" + opts.port;
        }
    }

    /**
     * Loads the fixture data, and returns a jQuery Deferred.
     * This Deferred can be used to attach other event handlers
     * to the Ajax request.
     */
    FixturesService.prototype.load = function(params) {
        var self = this;
        var opts = this.opts;

        var s = "";
        if (params) {
            s = ("string" !== typeof params) ? $.param(params) : params;
            s += "&";
        }
        s += "callback=?";

        var url = "" + opts.host + opts.path + "?" + s;

        return $.getJSON(url).then(function(data) {
            if (!data.errors || data.errors.length < 1) {
                return handleData(data);
            }
            return data;
        }, function(response, status, xhr) {
            if (status !== "error") {
                return;
            }
            var arr = [url].concat(Array.prototype.slice.call(arguments));
            alert(arr.join("\n"));
        });
    };

    return FixturesService;

});