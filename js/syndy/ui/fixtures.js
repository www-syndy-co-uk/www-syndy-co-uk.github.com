/*global syndy*/
define([
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
model.on("change", onFixturesChanged);

var view = new FixtureListView({
    el: $(".rounds")[0],
    model: model,
    $roundTemplate: $("#roundTemplate"),
    $fixtureTemplate: $("#fixtureTemplate")
});





function onFixturesChanged(model, options) {
    var data = model.attributes;
    if (!data.error) {
        initSelTeam(data.teams);
        initSelMonth();
        initSelRound(data.rounds.length);
    }
}

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
    return fixturesService.load(params).then(onFixturesLoaded, onFixturesLoaded);
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
