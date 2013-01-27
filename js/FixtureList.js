/*globals window, console*/
define(["jquery", "FixturesService"], function (jQuery, FixturesService) {

var $ = jQuery;
var _ = window["_"];




function IconManager() {
    var icons = {};
    var iconPrefix = "http://upload.wikimedia.org/wikipedia/commons/thumb";
    icons["Bradford Bulls"] = iconPrefix + "/e/eb/Bullscolours.svg/16px-Bullscolours.svg.png";
    icons["Castleford Tigers"] = iconPrefix + "/f/fd/Castleford_colours.svg/16px-Castleford_colours.svg.png";
    icons["Catalan Dragons"] = iconPrefix + "/0/0c/Catalanscolours.svg/16px-Catalanscolours.svg.png";
    icons["Huddersfield Giants"] = iconPrefix + "/7/73/Giantscolours.svg/16px-Giantscolours.svg.png";
    icons["Hull FC"] = iconPrefix + "/6/65/Hullcolours.svg/16px-Hullcolours.svg.png";
    icons["Hull Kingston Rovers"] = iconPrefix + "/8/8f/HKRcolours.svg/16px-HKRcolours.svg.png";
    icons["Leeds Rhinos"] = iconPrefix + "/5/5f/Rhinoscolours.svg/16px-Rhinoscolours.svg.png";
    icons["London Broncos"] = iconPrefix + "/f/f8/Quinscolours.svg/16px-Quinscolours.svg.png";
    icons["Harlequins RL"] = iconPrefix + "/f/f8/Quinscolours.svg/16px-Quinscolours.svg.png";
    icons["Salford City Reds"] = iconPrefix + "/8/81/Redscolours.svg/16px-Redscolours.svg.png";
    icons["St. Helens"] = iconPrefix + "/5/5e/Saintscolours.svg/16px-Saintscolours.svg.png";
    icons["Wakefield Wildcats"] = iconPrefix + "/e/e8/Wcatscolours.svg/16px-Wcatscolours.svg.png";
    icons["Warrington Wolves"] = iconPrefix + "/f/fd/Wolvescolours.svg/16px-Wolvescolours.svg.png";
    icons["Widnes Vikings"] = iconPrefix + "/e/ec/Widnes_colours.svg/16px-Widnes_colours.svg.png";
    icons["Wigan Warriors"] = iconPrefix + "/c/c0/Wigancolours.svg/16px-Wigancolours.svg.png";

    icons["Bradford"] = icons["Bradford Bulls"];
    icons["Castleford"] = icons["Castleford Tigers"];
    icons["Catalans Dragons"] = icons["Catalan Dragons"];
    icons["Huddersfield"] = icons["Huddersfield Giants"];
    icons["Hull"] = icons["Hull FC"];
    icons["Hull K R"] = icons["Hull Kingston Rovers"];
    icons["Leeds"] = icons["Leeds Rhinos"];
    icons["Salford"] = icons["Salford City Reds"];
    icons["St Helens"] = icons["St. Helens"];
    icons["Wakefield"] = icons["Wakefield Wildcats"];
    icons["Warrington"] = icons["Warrington Wolves"];
    icons["Widnes"] = icons["Widnes Vikings"];
    icons["Wigan"] = icons["Wigan Warriors"];

    this.getIconUrl = function (teamName) {
        return icons[teamName];
    };
}





var iconManager = new IconManager();





function FixtureList (opts) {

opts = opts || {};
var $rounds = opts.$rounds;
var $roundTemplate = opts.$roundTemplate;
var $fixtureTemplate = opts.$fixtureTemplate;
var iconRetriever = opts.iconRetriever || function (teamName) { return iconManager.getIconUrl(teamName); };

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

function createRoundElement(roundIdx, round, teams, teamIds) {
    if (!round || round.length < 1) {
        return null;
    }

    var strRound = $roundTemplate.html().trim();
    var tmplRound = _.template(strRound);
    var elRound = $(tmplRound({
        round: {
            name: "" + (roundIdx+1)
        }
    }));

    var strFixture = $fixtureTemplate.html().trim();
    var tmplFixture = _.template(strFixture);

    var elFixtures = elRound.find(".fixtures tbody");
    var prevKickOff = null;
    $(round).each(function (fixtureIdx, fixture) {
        var team1 = resolveTeam(fixture.teamId1, teams);
        var team2 = resolveTeam(fixture.teamId2, teams);
        var team1Id = teamIds[team1];
        var team2Id = teamIds[team2];
        var elFixture = $(tmplFixture({
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
            elFixture = elFixture.slice(1);
        }
        prevKickOff = fixture.kickOff;
        elFixtures.append(elFixture);
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
    $(fixtures).each(function (fixtureIdx, fixture) {
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
    $rounds.html("");

    var fixtures = data.fixtures;
    var rounds = data.rounds;
    var teams = data.teams;

    var teamIds = createTeamIds(fixtures, teams);
    $(rounds).each(function (roundIdx, round) {
        var elRound = createRoundElement(roundIdx, round, teams, teamIds);
        if (elRound) {
          $rounds.append(elRound);
        }
    });

    // Broadcast the fact that the data has been loaded.
    // Currently only listened to by the test code.
    // jQuery.trigger() is synchronous, so setTimeout adds async notification.
    window.setTimeout(function () {
        $(window.document).trigger("dataLoaded");
    }, 1);
}

    this.refreshData = refreshData;
}





return FixtureList;

});
