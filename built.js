
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

define('main',["syndy/ui/login-button", "syndy/ui/latest-odds"], function() {
});
