define(["jquery", "underscore", "OddsService", "TeamIcons"], function ($, _, OddsService, TeamIcons) {





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

    function onAllLoadMatchesDone (numMatches) {
        var loadEnd = new Date().getTime() - loadStart;
        $(".loadTime").text("Loaded " + numMatches + " markets in " + loadEnd + "ms");

        // Got all the data
        // Only call when dom:ready
        $(function () {
            $(".loading").hide();
            $(".filter").show();
        });
    }

    function onLoadMatchDone (data) {
        var done = (++matchesLoaded === matchesToLoad);

        if (done) {
            onAllLoadMatchesDone(matchesToLoad);
        }

        // Got some of the data
        // Only call when dom:ready
        $(function () {
            var match = data;
            var elMatch = createMatchElement(match);
            if (elMatch) {
                $matches.append(elMatch);
            }
        });
    }

    oddsService.loadMatchSummaries().done(function(data, textStatus, jqXHR) {
        matchesToLoad = 0;

        if (data.length < 1) {
            // No summaries
            onAllLoadMatchesDone(0);
            return;
        }

        for (var i = 0; i < data.length; i++) {
            var matchSummary = data[i];
            var include = matchFilter(matchSummary);
            if (include) {
                (function (div) {
                    // closure to capture new div
                    div.html(matchSummary.team1 + " v " + matchSummary.team2);
                    $matches.append(div);
                    matchesToLoad++;
                    oddsService.loadMatch(matchSummary.id).done(function (data) {
                        div.remove();
                        onLoadMatchDone.call(this, data);
                    });
                }($("<div/>")));
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

loadMatches(findFilter());





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




$(function () {
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
});



});
