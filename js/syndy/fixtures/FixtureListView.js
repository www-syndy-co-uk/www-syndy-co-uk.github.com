/*globals window, console*/
define([
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
        m = s.match(/[0-9]+/);
        if (m && m[0].length < 2) {
            s = s.substring(0, m.index) + "0" + s.substring(m.index);
        }

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