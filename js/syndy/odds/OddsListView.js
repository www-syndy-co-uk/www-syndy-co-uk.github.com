define([
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

    /**
     * Ties up the team1 and team2 bet options to a single row per bookmaker.
     */
    function createBetRows(match) {
        match.bets.sort(compareByBetBookmaker);

        var curBookie = {};

        var rows = [];

        _.forEach(match.bets, function(bet) {
            //console.log(betIdx + "," + bet.name + "," + bet.bookmaker);
            if (bet.handicap && bet.handicap.length > 0 && bet.handicap[0] == "+") {
                bet.handicap = bet.handicap.substring(1);
            }
            if (null != curBookie.bookmaker && bet.bookmaker != curBookie.bookmaker) {
                rows.push(curBookie);
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
        rows.push(curBookie);

        return rows;
    }

    function createMatchElement(match, matchTpl) {

        function extendBet(bet) {
            return _.extend({}, bet, {
                odds: ("undefined" !== typeof bet.odds) ? Odds.toString(bet.odds) : ""
            });
        }

        function createBookmakersOddsEl(curBookie) {
            var bet1 = curBookie.bet1 || {};
            var bet2 = curBookie.bet2 || {};
            var team1ColourCssClass = teamIcons.getIconClass(bet1.name);
            var team2ColourCssClass = teamIcons.getIconClass(bet2.name);
            var ob = {
                // check both bets in case there is only one provided.
                bookmaker: bet1.bookmaker || bet2.bookmaker,
                bet1: extendBet(bet1),
                bet2: extendBet(bet2),
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

        _.forEach(createBetRows(match), function(row) {
            var elBet = createBookmakersOddsEl(row);
            elBets.append(elBet);
        });

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

            if (data.error) {
                this.$el.html(data.url + ", " + data.statusText);
            } else {
                this.$el.append(createMatchElement(data, this.matchTpl));
            }

            return this;
        }
    });

    OddsListView.createMatchElement = createMatchElement;
    OddsListView.createBetRows = createBetRows;

    return OddsListView;

});
