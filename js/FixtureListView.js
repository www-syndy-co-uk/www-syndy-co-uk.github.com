/*globals window, console*/
define(["jquery", "_", "TeamIcons"], function($, _, TeamIcons) {

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

    function resolveTeam(team, teams) {
        if (!teams) {
            return team;
        }
        return teams[team];
    }

    function defaultIconRetriever(teamIcons, teamName) {
        return teamIcons.getIconUrl(teamName);
    }

    function FixtureListView(opts) {

        opts = opts || {};
        var $rounds = opts.$rounds;
        var $roundTemplate = opts.$roundTemplate;
        var $fixtureTemplate = opts.$fixtureTemplate;
        var iconRetriever = opts.iconRetriever || defaultIconRetriever.bind(teamIcons);

        function createRoundElement(roundIdx, round, teams, teamIds) {
            /**
             * This function will set the data-fixtureId attribute on the table
             * row, and any child elements that have a data-fixtureId attribute.
             */
            function setMetaData($tr, fixtureIdx) {
                $tr.find("[data-fixtureId]").add($tr).each(function() {
                    $(this).attr('data-fixtureId', fixtureIdx);
                });
            }

            if (!round || round.length < 1) {
                return null;
            }

            var strRound = $roundTemplate.html().trim();
            var tmplRound = _.template(strRound);
            var elRound = $(tmplRound({
                round: {
                    name: "" + (roundIdx + 1)
                }
            }));

            var strFixture = $fixtureTemplate.html().trim();
            var tmplFixture = _.template(strFixture);

            var tbody = elRound.find(".fixtures tbody");
            var prevKickOff = null;
            $(round).each(function(fixtureIdx, fixture) {
                var team1 = resolveTeam(fixture.teamId1, teams);
                var team2 = resolveTeam(fixture.teamId2, teams);
                var team1Id = teamIds[team1];
                var team2Id = teamIds[team2];
                var trFixture = $(tmplFixture({
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

        /**
         * Create a map of [team name/string] -> [team id/int].
         */
        function createTeamIds(fixtures, teams) {
            // Keep a team id Map for adding id attrs to team elements
            var teamIds = {};
            var teamIdCount = 0;
            $(fixtures).each(function(fixtureIdx, fixture) {
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


        function refreshData(data) {
            console.log("refreshData", data);
            $rounds.html("");

            var fixtures = data.fixtures;
            var rounds = data.rounds;
            var teams = data.teams;

            var teamIds = createTeamIds(fixtures, teams);
            $(rounds).each(function(roundIdx, round) {
                var elRound = createRoundElement(roundIdx, round, teams, teamIds);
                if (elRound) {
                    $rounds.append(elRound);
                }
            });

            // Broadcast the fact that the data has been loaded.
            // Currently only listened to by the test code.
            // jQuery.trigger() is synchronous, so setTimeout adds async notification.
            window.setTimeout(function() {
                $(window.document).trigger("dataLoaded");
            }, 1);
        }

        this.refreshData = refreshData;
    }

    // ----------
    // 'statics'
    // ----------

    FixtureListView.getFixtureInfo = function(el) {
        return {
            fixtureId: FixtureListView.getFixtureId(el),
            isHome: FixtureListView.isHome(el)
        };
    };

    FixtureListView.getFixtureId = function(el) {
        return parseInt($(el).attr("data-fixtureId"), 10);
    };

    FixtureListView.isHome = function(el) {
        return "true" === $(el).attr("data-home");
    };

    // ----------
    // return
    // ----------

    return FixtureListView;

});