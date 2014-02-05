
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

define('OddsService',["jquery"], function (jQuery) {

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

define('TeamIcons',["underscore"], function(_) {

    function TeamIcons() {
        var icons = this.icons = {};
        var iconPrefix = "http://upload.wikimedia.org/wikipedia/commons/thumb";

        icons["Bradford Bulls"] = "/e/eb/Bullscolours.svg/16px-Bullscolours.svg.png";
        icons["Castleford Tigers"] = "/f/fd/Castleford_colours.svg/16px-Castleford_colours.svg.png";
        icons["Catalan Dragons"] = "/0/0c/Catalanscolours.svg/16px-Catalanscolours.svg.png";
        icons["Huddersfield Giants"] = "/7/73/Giantscolours.svg/16px-Giantscolours.svg.png";
        icons["Hull FC"] = "/6/65/Hullcolours.svg/16px-Hullcolours.svg.png";
        icons["Hull Kingston Rovers"] = "/8/8f/HKRcolours.svg/16px-HKRcolours.svg.png";
        icons["Leeds Rhinos"] = "/5/5f/Rhinoscolours.svg/16px-Rhinoscolours.svg.png";
        icons["London Broncos"] = "/f/f8/Quinscolours.svg/16px-Quinscolours.svg.png";
        icons["Harlequins RL"] = "/f/f8/Quinscolours.svg/16px-Quinscolours.svg.png";
        icons["Salford Red Devils"] = "/8/81/Redscolours.svg/16px-Redscolours.svg.png";
        icons["St. Helens"] = "/5/5e/Saintscolours.svg/16px-Saintscolours.svg.png";
        icons["Wakefield Wildcats"] = "/e/e8/Wcatscolours.svg/16px-Wcatscolours.svg.png";
        icons["Warrington Wolves"] = "/f/fd/Wolvescolours.svg/16px-Wolvescolours.svg.png";
        icons["Widnes Vikings"] = "/e/ec/Widnes_colours.svg/16px-Widnes_colours.svg.png";
        icons["Wigan Warriors"] = "/c/c0/Wigancolours.svg/16px-Wigancolours.svg.png";
        _.each(icons, function(value, key) {
            icons[key] = iconPrefix + value;
        });

        icons["Bradford"] = icons["Bradford Bulls"];
        icons["Castleford"] = icons["Castleford Tigers"];
        icons["Catalans Dragons"] = icons["Catalan Dragons"];
        icons["Huddersfield"] = icons["Huddersfield Giants"];
        icons["Hull"] = icons["Hull FC"];
        icons["Hull K R"] = icons["Hull Kingston Rovers"];
        icons["Leeds"] = icons["Leeds Rhinos"];
        icons["Salford"] = icons["Salford Red Devils"];
        icons["St Helens"] = icons["St. Helens"];
        icons["Wakefield"] = icons["Wakefield Wildcats"];
        icons["Warrington"] = icons["Warrington Wolves"];
        icons["Widnes"] = icons["Widnes Vikings"];
        icons["Wigan"] = icons["Wigan Warriors"];
    }

    TeamIcons.prototype.getIconUrl = function(teamName) {
        return this.icons[teamName];
    };

    TeamIcons.prototype.keys = function() {
        return _.keys(this.icons);
    };

    return TeamIcons;

});
define('syndy/ui/latest-odds',["jquery", "underscore", "OddsService", "TeamIcons"], function ($, _, OddsService, TeamIcons) {





var oddsService = new OddsService(syndy.apiRoot, window.location.port);
var teamIcons = new TeamIcons();





function loadMatches (matchFilter) {
    var loadStart = new Date().getTime();

    var $matches = $(".matches").first();
    $matches.html("");

    $(".loading").show();
    $(".filter").hide();

    var matchesToLoad = 0;
    var matchesLoaded = 0;

    function onAllLoadMatchesDone(numMatches) {
        var loadEnd = new Date().getTime() - loadStart;
        $(".loadTime").text("Loaded " + numMatches + " markets in " + loadEnd + "ms");

        // Got all the data
        // Only call when dom:ready
        //$(function () {
            $(".loading").hide();
            $(".filter").show();
        //});

        dfd.resolve(result);
    }

    function onLoadMatchDone(data) {
        var done = (++matchesLoaded === matchesToLoad);

        if (done) {
            onAllLoadMatchesDone(matchesToLoad);
        }

        // Got some of the data
        // Only call when dom:ready
        //$(function () {
            var match = data;
            var elMatch = createMatchElement(match);
            if (elMatch) {
                $matches.append(elMatch);
            }
        //});
    }

    var dfd = $.Deferred();
    var result = {};

    oddsService.loadMatchSummaries().done(function(data, textStatus, jqXHR) {
        matchesToLoad = 0;
        result.matchSummaries = data;

        if (data.length < 1) {
            // No summaries
            onAllLoadMatchesDone(0);
            return;
        }

        for (var i = 0; i < data.length; i++) {
            var matchSummary = data[i];
            var include = matchFilter(matchSummary);
            if (include) {
                (function(i, div) {
                    // closure to capture new div
                    div.html(matchSummary.team1 + " v " + matchSummary.team2);
                    $matches.append(div);
                    matchesToLoad++;
                    oddsService.loadMatch(matchSummary.id).done(function (data) {
                        result.matches = (result.matches || []);
                        result.matches[i] = data;
                        div.remove();
                        onLoadMatchDone.call(this, data);
                    });
                }(i, $("<div/>")));
            }
        }
        if (0 == matchesToLoad) {
            // Filtered everything out!
            onAllLoadMatchesDone(0);
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        alert(textStatus);
        console.log(jqXHR, textStatus, errorThrown);
    });

    return dfd.promise();
}

// Start the load as soon as possible
function findFilter () {
    /**
     * Should we show the match. Currently implemented as must be a super league team involved.
     */
    function superLeagueFilter (matchSummary) {
        if (teamIcons.getIconUrl(matchSummary.team1) || teamIcons.getIconUrl(matchSummary.team2)) {
            return true;
        }
        return false;
    }

    var isSuperLeagueOnly = window.location.href.indexOf("superLeagueOnly") > -1;
    if (isSuperLeagueOnly) {
        return superLeagueFilter;
    }
    return function () { return true; };
}






function createMatchElement(match) {
    function oddsToString (odds) {
        if (!odds) {
            return "?";
        }
        var f = odds.asFraction;
        var d = odds.asDouble;
        if (f) {
            return "" + f.numerator + "/" + f.denominator;
        }
        return d;
    }

    function createBookmakersOddsEl (curBookie) {
        var bet1 = curBookie.bet1 || {};
        var bet2 = curBookie.bet2 || {};
        var src1 = teamIcons.getIconUrl(bet1.name);
        var src2 = teamIcons.getIconUrl(bet2.name);
        var defaultSrc = "http://upload.wikimedia.org/wikipedia/commons/c/ce/Transparent.gif";
        var ob = {
            bet1: $.extend({}, bet1, {odds: oddsToString(bet1.odds) }),
            bet2: $.extend({}, bet2, {odds: oddsToString(bet2.odds) }),
            draw: { odds: curBookie.draw ? oddsToString(curBookie.draw.odds) : "" },
            src1: src1 ? src1 : defaultSrc,
            src2: src2 ? src2 : defaultSrc
        };
        var elBet = $(tmplBet(ob));
        return elBet;
    }

    if (!match.bets || match.bets.length < 1) {
        return null;
    }

    // MUST use .html().trim() to work in IE
    var strMatch = $("#matchTemplate").html().trim();
    var tmplMatch = _.template(strMatch);
    var elMatch = $(tmplMatch({
        match: match
    }));

    // MUST use .html().trim() to work in IE
    var strBet = $("#betTemplate").html().trim();
    var tmplBet = _.template(strBet);

    var elBets = elMatch.find(".bets tbody");

    match.bets.sort(function (b1, b2) {
        if (b1.bookmaker < b2.bookmaker) {
            return -1;
        }
        if (b1.bookmaker > b2.bookmaker) {
            return 1;
        }
        return 0;
    });

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




function init() {
    function oddsStrToFloat (s) {
        var idx = s.indexOf("/");
        if (idx < 0) {
            return parseFloat(s);
        }
        return parseInt(s.substring(0, idx).trim()) / parseInt(s.substring(idx+1).trim());
    }

    function compareAsOddsDraw (txt1, txt2) {
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
    }

    function compareAsOdds (txt1, txt2) {
        return oddsStrToFloat(txt1) - oddsStrToFloat(txt2);
    }

    function compareAsText(txt1, txt2) {
        var same = (txt1 == txt2);
        return same ? 0 : (txt1 > txt2 ? -1 : 1);
    }

    function compareAsHandicap(txt1, txt2) {
        if (txt1.length > 0 && txt1[0] == '+') {
            txt1 = txt1.substring(1);
        }
        if (txt2.length > 0 && txt2[0] == '+') {
            txt2 = txt2.substring(1);
        }
        return parseFloat(txt1) - parseFloat(txt2);
    }

    // bookmaker, img, odds, handicap, odds, handicap, odds, img
    var compareFns = [compareAsText, null, compareAsOdds, compareAsHandicap, compareAsOddsDraw, compareAsHandicap, compareAsOdds, null];

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
    loadMatches: loadMatches,
    findFilter: findFilter,
    init: init
};

});

/*global window, alert*/
define('FixturesService',["jquery"], function ($) {

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

        return $.getJSON(url).then(function (data) {
            if (!data.errors || data.errors.length < 1) {
                return handleData(data);
            }
            return data;
        }).fail(function (response, status, xhr) {
            if (status !== "error") {
                return;
            }
            var arr = [url].concat(Array.prototype.slice.call(arguments));
            alert(arr.join("\n"));
        });
    };

    return FixturesService;

});

define('FixtureListModel',["backbone"], function(Backbone) {

    var FixtureListModel = Backbone.Model.extend({

        initialize: function() {}

    });

    // ----------
    // return
    // ----------

    return FixtureListModel;

});
/*globals window, console*/
define('FixtureListView',["jquery", "underscore", "backbone", "TeamIcons"], function($, _, Backbone, TeamIcons) {

    var teamIcons = new TeamIcons();

    function formatKickOff(kickOff) {
        var s = "" + new Date(kickOff).toUTCString();
        // 00:00:00 means kickoff time unknown
        s = s.replace(/00:00:00/, "??:??:??");
        var i = s.indexOf("(");
        if (i > -1) {
            s = s.substring(0, i).trim();
        }
        return s;
    }

    function defaultIconRetriever(teamIcons, teamName) {
        return teamIcons.getIconUrl(teamName);
    }

    function createRoundElement(roundTpl, fixtureTpl, iconRetriever, roundIdx, round, teams) {
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
            var team1Id = team1;
            var team2Id = team2;
            var trFixture = $(fixtureTpl({
                kickOff: formatKickOff(fixture.kickOff),
                team1: team1,
                team2: team2,
                team1Id: team1Id,
                team2Id: team2Id,
                src1: iconRetriever(team1),
                src2: iconRetriever(team2),
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

        initialize: function(opts) {
            this.options = opts;
            opts.iconRetriever = opts.iconRetriever || _.bind(defaultIconRetriever, null, teamIcons);
            // Cache the template function for a single item.
            this.roundTpl = _.template(opts.$roundTemplate.html());
            this.fixtureTpl = _.template(opts.$fixtureTemplate.html());
            this.listenTo(this.model, "change", this.render);
        },

        // Re-render the titles of the todo item.
        render: function() {
            var opts = this.options;
            var data = this.model.attributes;

            var fixtures = data.fixtures;
            var rounds = data.rounds;
            var teams = data.teams;

            this.$el.html("");
            _.each(rounds, function(round, idx) {
                var elRound = createRoundElement(this.roundTpl, this.fixtureTpl, opts.iconRetriever, idx, round, teams);
                if (elRound) {
                    this.$el.append(elRound);
                }
            }, this);

            return this;
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

    // ----------
    // return
    // ----------

    return FixtureListView;

});
/*global syndy*/
define('syndy/ui/fixtures',["jquery", "FixturesService", "FixtureListModel", "FixtureListView"], function ($, FixturesService, FixtureListModel, FixtureListView) {


var fixturesService = new FixturesService({
    host: syndy.apiRoot,
    port: window.location.port
});
var model = new FixtureListModel();
var ui = new FixtureListView({
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
    var prevTeamId = null;
    // Only register one click handler, instead of a click handler per team, per fixture, per round.
    // So that's one click handler, versus 2*7*27.
    $(document).click(function (evt) {
        var t = $(evt.target);
        if (t.is(".team1, .team2")) {
            var teamId = /(teamid_\w*)/.exec(t.attr("class"))[1];
            if (prevTeamId) {
                $("." + prevTeamId).removeClass("highlight");
            }
            $("." + teamId).addClass("highlight");
            prevTeamId = teamId;
        }
    });

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
