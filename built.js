
define('LogonService',["jquery"], function (jQuery) {

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
// Globals:
//   Adds syndy.loginInfo object

define('syndy/ui/login-button',["jquery", "LogonService"], function ($, LogonService) {
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

define('syndy/odds/Odds',[],function() {

    function Odds() {}

    Odds.toString = function(odds) {
        if (!odds) {
            return "?";
        }
        var f = odds.asFraction;
        var d = odds.asDouble;
        if (f) {
            return "" + f.numerator + "/" + f.denominator;
        }
        return d;
    };

    Odds.strToFloat = function(s) {
        var idx = s.indexOf("/");
        if (idx < 0) {
            return parseFloat(s);
        }
        var num = s.substring(0, idx).trim();
        var denom = s.substring(idx + 1).trim();
        return parseInt(num) / parseInt(denom);
    };

    return Odds;

});

define('syndy/ajax',[
    "jquery",
    "q"
], function($, Q) {

    // http://forum.jquery.com/topic/jquery-ajax-with-datatype-jsonp-will-not-use-error-callback-if-request-fails

    /**
     * Makes a jQuery ajax call (as JSONP).
     *
     * We need JSONP as we're cross domain (e.g. www.syndy.co.uk calling api.syndy.co.uk).
     *
     * If the JSONP is a success, the data is returned as normal.
     *
     * If there is an error (i.e. there is an "errors" field), we decorate the error with the URL,
     * and throw the error which will trigger the failure callbacks on the returned promise.
     *
     * Why can't we use HTTP status codes to send errors? Why do we need to send back an errors object
     * (with a HTTP 200)?
     *
     * Because JSONP and error callbacks don't play well when cross-domain. We NEED a valid JSON
     * response in order to trigger the callbacks (either success or failure, it doesn't matter).
     *
     * @return A Q promise.
     */
    function getJSON(url, settings) {
        url += (url.indexOf("?") > -1) ? "&" : "?";
        url += "callback=";
        url += "?";
        return Q($.getJSON(url, settings)).then(function(data) {
            data = ("string" === typeof data) ? JSON.parse(data) : data;
            if (data.errors) {
                data.url = url;
                throw data;
            }
            return data;
        });
    }

    return {
        getJSON: getJSON
    };

});

define('syndy/promise/utils',[
    "q"
], function(Q) {

    /**
     * Resolves the provided promises, and sends out a progress notification for each.
     *
     * @return A Q promise.
     */
    function allSettledAndNotify(promises) {
        function callback(i) {
            return function(response) {
                results[i] = response;
                d.notify({
                    list: results,
                    response: response,
                    i: i,
                    size: size,
                    count: (++count)
                });
            };
        }

        var d = Q.defer();
        var results = [];
        var size = promises.length;
        var count = 0;
        promises = _.map(promises, function(p, i) {
            // save either success response or error response to the list.
            var cb = callback(i);
            return p.then(cb, cb);
        });

        var resolve = function() {
            d.resolve(results);
        };

        Q.allSettled(promises).then(resolve, resolve);
        return d.promise;
    }

    return {
        allSettledAndNotify: allSettledAndNotify
    };

});

define('syndy/odds/OddsService',[
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
        return ajax.getJSON(url).then(function(data) {
            return {
                matches: data
            };
        });
    };

    OddsService.prototype.loadMatch = function(matchId) {
        var url = this.opts.host + "/odds/matches?matchId=" + matchId;
        return ajax.getJSON(url).then(function(data) {
            return {
                match: data
            };
        });
    };

    OddsService.prototype.loadMatchSummaries = function() {
        var url = this.opts.host + "/odds/matchSummaries";
        return ajax.getJSON(url).then(function(data) {
            return {
                matchSummaries: data
            };
        });
    };

    OddsService.prototype.loadSummariesThenMatches = function(matchFilter) {
        var self = this;

        matchFilter = matchFilter || trueFilter;

        return this.loadMatchSummaries().then(function(response) {
            var matchSummaries = _.filter(response.matchSummaries, matchFilter);

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

define('syndy/odds/MarketModel',["backbone"], function(Backbone) {

    var MarketModel = Backbone.Model.extend({

        initialize: function() {}

    });

    return MarketModel;

});

define('syndy/odds/OddsListModel',["backbone", "./MarketModel"], function(Backbone, MarketModel) {

    var OddsListModel = Backbone.Collection.extend({

        model: MarketModel

    });

    return OddsListModel;

});

define('TeamIcons',["underscore"], function(_) {

    var aliases = {
        "Bradford Bulls": ["Bradford"],
        "Castleford Tigers": ["Castleford"],
        "Catalan Dragons": ["Catalans", "Catalan Dragons"],
        "Huddersfield Giants": ["Huddersfield"],
        "Hull FC": ["Hull"],
        "Hull Kingston Rovers": ["Hull K R", "Hull KR"],
        "Leeds Rhinos": ["Leeds"],
        "London Broncos": ["London"],
        "Salford Red Devils": ["Salford"],
        "St. Helens": ["St Helens"],
        "Wakefield Wildcats": ["Wakefield"],
        "Warrington Wolves": ["Warrington"],
        "Widnes Vikings": ["Widnes"],
        "Wigan Warriors": ["Wigan"]
    };

    function setForAllAliases(map) {
        _.each(aliases, function(value, key) {
            _.each(value, function(alias) {
                map[alias] = map[key];
            });
        });
    }

    function TeamIcons() {
        var icons = this.icons = {};
        var css = this.css = {};

        var iconPrefix = "http://upload.wikimedia.org/wikipedia/commons/thumb";

        icons["Bradford Bulls"] = "/e/eb/Bullscolours.svg/16px-Bullscolours.svg.png";
        icons["Castleford Tigers"] = "/f/fd/Castleford_colours.svg/16px-Castleford_colours.svg.png";
        icons["Catalan Dragons"] = "/0/0c/Catalanscolours.svg/16px-Catalanscolours.svg.png";
        icons["Huddersfield Giants"] = "/7/73/Giantscolours.svg/16px-Giantscolours.svg.png";
        icons["Hull FC"] = "/6/65/Hullcolours.svg/16px-Hullcolours.svg.png";
        icons["Hull Kingston Rovers"] = "/8/8f/HKRcolours.svg/16px-HKRcolours.svg.png";
        icons["Leeds Rhinos"] = "/5/5f/Rhinoscolours.svg/16px-Rhinoscolours.svg.png";
        icons["London Broncos"] = "/f/f8/Quinscolours.svg/16px-Quinscolours.svg.png";
        icons["Salford Red Devils"] = "/8/81/Redscolours.svg/16px-Redscolours.svg.png";
        icons["St. Helens"] = "/5/5e/Saintscolours.svg/16px-Saintscolours.svg.png";
        icons["Wakefield Wildcats"] = "/e/e8/Wcatscolours.svg/16px-Wcatscolours.svg.png";
        icons["Warrington Wolves"] = "/f/fd/Wolvescolours.svg/16px-Wolvescolours.svg.png";
        icons["Widnes Vikings"] = "/e/ec/Widnes_colours.svg/16px-Widnes_colours.svg.png";
        icons["Wigan Warriors"] = "/c/c0/Wigancolours.svg/16px-Wigancolours.svg.png";

        _.each(icons, function(value, key) {
            icons[key] = iconPrefix + value;
        });

        setForAllAliases(icons);

        css["Bradford Bulls"] = "Bulls";
        css["Castleford Tigers"] = "Castleford";
        css["Catalan Dragons"] = "Catalans";
        css["Huddersfield Giants"] = "Giants";
        css["Hull FC"] = "Hull";
        css["Hull Kingston Rovers"] = "HKR";
        css["Leeds Rhinos"] = "Rhinos";
        css["London Broncos"] = "Broncos";
        css["Salford Red Devils"] = "Reds";
        css["St. Helens"] = "Saints";
        css["Wakefield Wildcats"] = "Wcats";
        css["Warrington Wolves"] = "Wolves";
        css["Widnes Vikings"] = "Widnes";
        css["Wigan Warriors"] = "Wigan";

        _.each(css, function(value, key) {
            css[key] = "sprite_16px-" + value + "_colours";
        });

        setForAllAliases(css);
    }

    TeamIcons.prototype.getIconUrl = function(teamName) {
        return this.icons[teamName];
    };

    TeamIcons.prototype.getIconClass = function(teamName) {
        return this.css[teamName];
    };

    TeamIcons.prototype.keys = function() {
        return _.keys(this.icons);
    };

    return TeamIcons;

});

define('syndy/odds/OddsListView',[
    "jquery",
    "backbone",
    "underscore",
    "./Odds",
    "TeamIcons"
], function($, Backbone, _, Odds, TeamIcons) {

    var teamIcons = new TeamIcons();

    function compareByBetBookmaker(b1, b2) {
        if (b1.bookmaker < b2.bookmaker) {
            return -1;
        }
        if (b1.bookmaker > b2.bookmaker) {
            return 1;
        }
        return 0;
    }

    function createMatchElement(match, matchTpl) {

        function createBookmakersOddsEl(curBookie) {
            var bet1 = curBookie.bet1 || {};
            var bet2 = curBookie.bet2 || {};
            var team1ColourCssClass = teamIcons.getIconClass(bet1.name);
            var team2ColourCssClass = teamIcons.getIconClass(bet2.name);
            var ob = {
                // check both bets in case there is only one provided.
                bookmaker: bet1.bookmaker || bet2.bookmaker,
                bet1: $.extend({}, bet1, {odds: Odds.toString(bet1.odds) }),
                bet2: $.extend({}, bet2, {odds: Odds.toString(bet2.odds) }),
                draw: { odds: curBookie.draw ? Odds.toString(curBookie.draw.odds) : "" },
                team1ColourCssClass: team1ColourCssClass ? ("sprite " + team1ColourCssClass) : "",
                team2ColourCssClass: team2ColourCssClass ? ("sprite " + team2ColourCssClass) : ""
            };
            var elBet = $(tmplBet(ob));
            return elBet;
        }

        if (!match.bets || match.bets.length < 1) {
            return null;
        }

        var elMatch = $(matchTpl({
            match: match
        }));

        // MUST use .html().trim() to work in IE
        var strBet = $("#betTemplate").html().trim();
        var tmplBet = _.template(strBet);

        var elBets = elMatch.find(".bets tbody");

        match.bets.sort(compareByBetBookmaker);

        var curBookie = {};

        $(match.bets).each(function (betIdx, bet) {
            //console.log(betIdx + "," + bet.name + "," + bet.bookmaker);
            if (bet.handicap && bet.handicap.length > 0 && bet.handicap[0] == "+") {
                bet.handicap = bet.handicap.substring(1);
            }
            if (null != curBookie.bookmaker && bet.bookmaker != curBookie.bookmaker) {
                var elBet = createBookmakersOddsEl(curBookie);
                elBets.append(elBet);
                curBookie = {};
            }
            if ("Draw" === bet.name) {
                curBookie.draw = bet;
            } else if (match.team1 === bet.name) {
                curBookie.bet1 = bet;
            } else {
                curBookie.bet2 = bet;
            }
            curBookie.bookmaker = bet.bookmaker;
        });

        // Add the last one. Why? Because above we only add a bookie if the bookie changes.
        // For the last bookie this will never happen.
        var elBet = createBookmakersOddsEl(curBookie);
        elBets.append(elBet);

        return elMatch;
    }

    var OddsListView = Backbone.View.extend({
        matchTpl: null,

        initialize: function(opts) {
            opts = opts || {};

            this.options = opts;

            // MUST use .html().trim() to work in IE
            this.matchTpl = _.template(opts.$matchTemplate.html().trim());

            this.listenTo(this.model, "change", this.render);
        },

        render: function() {
            var data = this.model.attributes;

            this.$el.html("");

            if (data.errors) {
                this.$el.html(data.url + ", " + data.statusText);
            } else {
                this.$el.append(createMatchElement(data.match, this.matchTpl));
            }

            return this;
        }
    });

    OddsListView.createMatchElement = createMatchElement;

    return OddsListView;

});

define('syndy/ui/latest-odds',[
    "jquery",
    "underscore",
    "syndy/odds/Odds",
    "syndy/odds/OddsService",
    "syndy/odds/OddsListModel",
    "syndy/odds/OddsListView",
    "TeamIcons"
], function ($, _, Odds, OddsService, OddsListModel, OddsListView, TeamIcons) {

    var comparisonFunctions = {
        asOddsDraw: function(txt1, txt2) {
            // Remove the [] from around the odds
            txt1 = txt1.substring(1, txt1.length-1);
            txt2 = txt2.substring(1, txt2.length-1);
            if (!txt1) {
                // may be blank
                return -1;
            }
            if (!txt2) {
                // may be blank
                return 1;
            }
            return compareAsOdds(txt1, txt2);
        },

        asOdds: function(txt1, txt2) {
            return Odds.strToFloat(txt1) - Odds.strToFloat(txt2);
        },

        asText: function(txt1, txt2) {
            var same = (txt1 == txt2);
            return same ? 0 : (txt1 > txt2 ? -1 : 1);
        },

        asHandicap: function(txt1, txt2) {
            if (txt1.length > 0 && txt1[0] == '+') {
                txt1 = txt1.substring(1);
            }
            if (txt2.length > 0 && txt2[0] == '+') {
                txt2 = txt2.substring(1);
            }
            return parseFloat(txt1) - parseFloat(txt2);
        }
    };

    var OddsListModel = Backbone.Model.extend({
    });





    var oddsService = new OddsService({
        host: syndy.apiRoot,
        port: window.location.port
    });
    var teamIcons = new TeamIcons();

    function loadMatches(matchFilter) {
        if (!matchFilter) {
            throw new Error("matchFilter is mandatory");
        }

        var loadStart = new Date().getTime();

        var $matches = $(".matches").first();
        $matches.html("");

        $(".loading").show();
        $(".filter").hide();

        var dfd = $.Deferred();

        function onComplete(response) {
            $(".loading").hide();
            $(".filter").show();

            var loadEnd = new Date().getTime() - loadStart;
            $(".loadTime").text("Loaded " + response.matches.length + " markets in " + loadEnd + "ms");

            dfd.resolve(response.matches);
        }

        oddsService.loadSummariesThenMatches(matchFilter).then(onComplete, onComplete, function(progress) {
            var loadEnd = new Date().getTime() - loadStart;
            $(".loading span.status").text("Loaded " + progress.count + " markets in " + loadEnd + "ms");

            var match = progress.response;
            var model = new OddsListModel(match);
            var view = new OddsListView({
                model: model,
                $matchTemplate: $("#matchTemplate")
            });
            view.render();
            $matches.append(view.$el);
        });

        return dfd.promise();
    }

    var matchFilters = {
        superLeagueOnly: function superLeagueOnlyFilter(matchSummary) {
            if (teamIcons.getIconUrl(matchSummary.team1) && teamIcons.getIconUrl(matchSummary.team2)) {
                return true;
            }
            return false;
        },
        all: function() {
            return true;
        }
    };

    // Start the load as soon as possible
    function findFilterName(href) {
        href = href || window.location.href;

        var match = /odds.filter=([^#?&]*)/gi.exec(href);

        return (match && match[0]);
    }

    function findFilter(name) {
        return matchFilters[name] || matchFilters.all;
    }






    function init() {
        // bookmaker, img, odds, handicap, odds, handicap, odds, img
        var compareFns = [
            comparisonFunctions.compareAsText,
            null,
            comparisonFunctions.compareAsOdds, comparisonFunctions.compareAsHandicap,
            comparisonFunctions.compareAsOddsDraw,
            comparisonFunctions.compareAsHandicap, comparisonFunctions.compareAsOdds,
            null];

        // Only register one click handler, instead of a click handler per cell.
        $(document).on("click", "tr.bet>td", function (evt) {
            var td = $(this);
            //console.log(td);

            var tr = td.parent();
            //console.log(tr);

            var colIdx = tr.children().index(td);
            //console.log(colIdx);

            var compareFn = compareFns[colIdx];
            //console.log(compareFn);
            if (!compareFn) {
                return;
            }

            var tbody = tr.closest("tbody");
            var trs = tbody.find("tr");
            var trParent = tr.parent();
            trs.remove();
            trs.sort(function (tr1, tr2) {
                var td1 = $(tr1).children().eq(colIdx);
                var td2 = $(tr2).children().eq(colIdx);
                var txt1 = td1.text();
                var txt2 = td2.text();
                return compareFn(txt1, txt2);
            });
            trParent.append(trs);
        });
    }

    return {
        matchFilters: matchFilters,
        loadMatches: loadMatches,
        findFilter: findFilter,
        findFilterName: findFilterName,
        init: init
    };

});

/*global window, alert*/
define('syndy/fixtures/FixturesService',[
    "jquery",
    "underscore",
    "q",
    "syndy/ajax"
], function ($, _, Q, ajax) {

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
        // make copy
        opts = _.extend({}, opts);
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
        var opts = this.opts;

        var s = "";
        if (params) {
            s = "?" + ("string" !== typeof params) ? $.param(params) : params;
        }

        var url = "" + opts.host + opts.path + s;

        return ajax.getJSON(url).then(function(data) {
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

define('syndy/fixtures/FixtureListModel',["backbone"], function(Backbone) {

    var FixtureListModel = Backbone.Model.extend({

        initialize: function() {}

    });

    // ----------
    // return
    // ----------

    return FixtureListModel;

});
/*globals window, console*/
define('syndy/fixtures/FixtureListView',[
    "jquery",
    "underscore",
    "backbone",
    "TeamIcons"
], function($, _, Backbone, TeamIcons) {

    var teamIcons = new TeamIcons();

    /**
     * @param {string} kickOff E.g. "Thu, 20 Feb 2014 20:00:00 GMT"
     */
    function formatKickOff(kickOff) {
        var s = "" + new Date(kickOff).toUTCString();

        // 00:00:00 means kickoff time unknown
        //s = s.replace(/00:00:00/, "??:??:??");

        // If we don't have the time, then remove it (and everything after, like timezone).
        var m  = s.match(/00:00:00/);
        if (m) {
            s = s.substring(0, m.index).trim();
        }

        // Make IE like other browsers, with leading zero for date.
        s = s.replace(/, ([1-9])/, ", 0$1");

        var i = s.indexOf("(");
        if (i > -1) {
            s = s.substring(0, i).trim();
        }

        return s;
    }

    function defaultIconRetriever(teamIcons, teamName) {
        return teamIcons.getIconUrl(teamName);
    }

    function defaultTeamColourCssClassRetriever(teamIcons, teamName) {
        return teamIcons.getIconClass(teamName);
    }

    function createRoundElement(roundTpl, fixtureTpl, teamColourCssClassRetriever, roundIdx, round, teams) {
        /**
         * This function will set the data-fixtureIdx attribute on the table
         * row, and any child elements that have a data-fixtureIdx attribute.
         */
        function setMetaData($tr, fixtureIdx) {
            $tr.find("[data-fixtureIdx]").add($tr).each(function() {
                $(this).attr('data-fixtureIdx', fixtureIdx);
            });
        }

        if (!round || round.length < 1) {
            return null;
        }

        var elRound = $(roundTpl({
            round: {
                name: "" + (roundIdx + 1)
            }
        }));

        var tbody = elRound.find(".fixtures tbody");
        var prevKickOff = null;
        $(round).each(function(fixtureIdx, fixture) {
            var team1 = fixture.team1;
            var team2 = fixture.team2;
            var team1Id = team1.replace(" ", "");
            var team2Id = team2.replace(" ", "");
            var trFixture = $(fixtureTpl({
                kickOff: formatKickOff(fixture.kickOff),
                team1: team1,
                team2: team2,
                team1Id: team1Id,
                team2Id: team2Id,
                team1ColourCssClass: teamColourCssClassRetriever(team1),
                team2ColourCssClass: teamColourCssClassRetriever(team2),
                score1: (fixture.score1 > -1) ? fixture.score1 : "",
                score2: (fixture.score1 > -1) ? fixture.score2 : "",
                htScore1: (fixture.score1 > -1) ? "(" + fixture.htScore1 + ")" : "",
                htScore2: (fixture.score1 > -1) ? "(" + fixture.htScore2 + ")" : "",
                score1class: (fixture.score1 >= fixture.score2) ? "won" : "",
                score2class: (fixture.score2 >= fixture.score1) ? "won" : ""
            }));
            if (prevKickOff == fixture.kickOff) {
                // Remove the first item, which is the kickoff row.
                trFixture = trFixture.slice(1);
            }
            setMetaData(trFixture, fixtureIdx);
            prevKickOff = fixture.kickOff;
            tbody.append(trFixture);
        });
        return elRound;
    }

    var FixtureListView = Backbone.View.extend({

        events: {
            "click .team1": "onClickTeam",
            "click .team2": "onClickTeam"
        },

        initialize: function(opts) {
            opts = opts || {};

            this.options = opts;

            opts.teamColourCssClassRetriever = opts.teamColourCssClassRetriever || _.bind(defaultTeamColourCssClassRetriever, null, teamIcons);
            // Cache the template function for a single item.
            this.roundTpl = _.template(opts.$roundTemplate.html());
            this.fixtureTpl = _.template(opts.$fixtureTemplate.html());

            this.listenTo(this.model, "change", this.render);

            this.lastClickedTeamId = null;
        },

        render: function() {
            var opts = this.options;
            var data = this.model.attributes;

            var fixtures = data.fixtures;
            var rounds = data.rounds;
            var teams = data.teams;

            this.$el.html("");
            _.each(rounds, function(round, idx) {
                var elRound = createRoundElement(this.roundTpl, this.fixtureTpl, opts.teamColourCssClassRetriever, idx, round, teams);
                if (elRound) {
                    this.$el.append(elRound);
                }
            }, this);

            return this;
        },

        onClickTeam: function(evt) {
            var t = $(evt.target);
            if (t.is(".team1, .team2")) {
                var teamId = /(teamid_\w*)/.exec(t.attr("class"))[1];
                if (this.lastClickedTeamId) {
                    $("." + this.lastClickedTeamId).removeClass("highlight");
                }
                $("." + teamId).addClass("highlight");
                this.lastClickedTeamId = teamId;
            }
        }

    });


    // ----------
    // 'statics'
    // ----------

    FixtureListView.getFixtureInfo = function(el) {
        return {
            fixtureIdx: FixtureListView.getFixtureIdx(el),
            isHome: FixtureListView.isHome(el)
        };
    };

    FixtureListView.getFixtureIdx = function(el) {
        return parseInt($(el).attr("data-fixtureIdx"), 10);
    };

    FixtureListView.isHome = function(el) {
        return "true" === $(el).attr("data-home");
    };

    FixtureListView.formatKickOff = formatKickOff;

    // ----------
    // return
    // ----------

    return FixtureListView;

});
/*global syndy*/
define('syndy/ui/fixtures',[
    "jquery",
    "syndy/fixtures/FixturesService",
    "syndy/fixtures/FixtureListModel",
    "syndy/fixtures/FixtureListView"
], function ($, FixturesService, FixtureListModel, FixtureListView) {


var fixturesService = new FixturesService({
    host: syndy.apiRoot,
    port: window.location.port
});
var model = new FixtureListModel();
var view = new FixtureListView({
    el: $(".rounds")[0],
    model: model,
    $roundTemplate: $("#roundTemplate"),
    $fixtureTemplate: $("#fixtureTemplate")
});





function initSelRound(size) {
    // TODO - GLOBAL LOOKUP
    var $selRound = $("select[name='selRound']").first();
    if ($selRound.find("option").length > 0) {
        // Don't replace existing rounds
        return;
    }

    $selRound.html("");
    $selRound.append($("<option value=''>All</option>"));
    for (var i = 0; i < size; i++) {
        $selRound.append($("<option value=" + (i+1) + ">" + (i+1) + "</option>"));
    }
}


function initSelTeam(teams) {
    // TODO - GLOBAL LOOKUP
    var $selTeam = $("select[name='selTeam']").first();
    if ($selTeam.find("option").length > 0) {
        // Don't replace existing teams
        return;
    }

    $selTeam.html("");
    $selTeam.append($("<option value=''>All</option>"));
    for (var teamIdx in teams) {
        $selTeam.append($("<option value=" + teamIdx + ">" + teams[teamIdx] + "</option>"));
    }
}


function initSelMonth() {
    // TODO - GLOBAL LOOKUP
    var $selMonth = $("select[name='selMonth']").first();
    if ($selMonth.find("option").length > 0) {
        // Don't replace existing months
        return;
    }

    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    $selMonth.html("");
    $selMonth.append($("<option value=''>All</option>"));
    $(months).each(function (idx, month) {
        $selMonth.append($("<option value=" + (idx+1) + ">" + month + "</option>"));
    });
}

function createOnFixturesLoadedHandler(searchLink) {
    var txt = searchLink.text();
    return function(data) {
    // Got the data
    // Only call refreshData when dom:ready
    //$(function () {
        $("div.search").show();
        $(".loading").hide();
        searchLink.text(txt);
        initSelTeam(data.teams);
        initSelMonth();
        initSelRound(data.rounds.length);
        model.set(data);
    //});
    };
}

function loadFixtures(params) {
    function defaultParams() {
        // Inspect the search (query params) string to see if we need to pass on query params to AJAX request.
        var search = window.location.search;
        if (search.length > 0) {
            // Remove "?" and replace with "&".
            search = "&" + search.substring(1);
        }
    }

    params = params || defaultParams();
    var searchLink = $("a.search").first();
    var onFixturesLoaded = createOnFixturesLoadedHandler(searchLink);
    searchLink.text("");
    $(".loading").show();
    $("div.search").hide();
    return fixturesService.load(params).done(onFixturesLoaded);
}





// Click team logic.
function init() {
    $("a.search").click(function (evt) {
        var $selTeam = $("select[name='selTeam']").first();
        var team = $selTeam.val();
        var $selMonth = $("select[name='selMonth']").first();
        var month = $selMonth.val();
        var $selRound = $("select[name='selRound']").first();
        var round = $selRound.val();
        var params = {};
        if (team) {
            params["team"] = $selTeam.find("option:selected").text();
        }
        if (month) {
            params["month"] = month;
        }
        if (round) {
            params["round"] = round;
        }
        loadFixtures(params);
    });
};

return {
    loadFixtures: loadFixtures,
    init: init
};

});

define('main',["syndy/ui/login-button", "syndy/ui/latest-odds", "syndy/ui/fixtures"], function() {
});
