define([
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
