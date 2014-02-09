define([
    "jquery",
    "backbone",
    "utils",
    "FixturesService",
    "TippingService",
    "TipsModel",
    "FixtureListView",
    "FixtureListModel",
    "FixtureListView",
    "SuperLeagueLogos"
], function ($, Backbone, utils, FixturesService, TippingService, TipsModel, FixtureListModel, FixtureListView, superLeagueLogos) {

var FixtureTip = TipsModel.FixtureTip,
    Tip = TipsModel.Tip,
    TipsModel = TipsModel.TipsModel,
    fixtureData = null,
    tipsListView = null,
    tippingService = new TippingService({
        host: syndy.apiRoot,
        port: window.location.port
    }),
    fixturesService = new FixturesService({
        host: syndy.apiRoot,
        port: window.location.port
    }),
    tipsModel = null;

function showInfo (items, className) {
    className = className || "alert-error";
    console.log("items", items);
    var $container = $(".alert-container").hide();
    var $div = $container.find("div").html("").removeClass().addClass("alert").addClass(className);
    if (items.length < 1) {
        return;
    }
    for (var i = 0; i < items.length; i++) {
        $div.append($("<div/>").html(items[i].msg));
    }
    $container.fadeIn();
}

var TipsListModel = Backbone.Model.extend();

var fixtureListModel = new FixtureListModel({});
var tipsListModel = new TipsListModel({});
tipsListView = new TipsListView({
    model: tipsListModel,
    el: ".tips",
    fixturesContainer: ".rounds"
});
var fixtureListView = new FixtureListView({
    model: fixtureListModel,
    el: ".rounds",
    $roundTemplate: $("#roundTemplate"),
    $fixtureTemplate: $("#fixtureTemplate"),
    iconRetriever: function (teamName) { return superLeagueLogos[teamName]; }
});

fixtureListModel.on("change", function (model) {
    console.log("fixtureListModel:change", arguments);

    var data = model.attributes;

    // console.fake means it's a shim, and we need to stringify to see anything meaningful
    console.log(console.fake ? JSON.stringify(data.teams, null, 2) : data.teams);
    console.log(console.fake ? JSON.stringify(data.rounds, null, 2) : data.rounds);
    console.log(console.fake ? JSON.stringify(data.fixtures, null, 2) : data.fixtures);

    $(".roundName").html(data.fixtures[0].round);

    tipsModel = new TipsModel({
        fixtures: data.fixtures
    });
});

function init() {
    $(".loading").show();

    function refreshTips (tip) {
        console.log("refreshTips", arguments);

        var whenStr = "No tips made yet";
        var tlu = $(".tips-last-updated");

        if (tip && tip.whenMade) {
            var d = new Date(tip.whenMade);
            // [+-]?, not all date strings have full timezone info (IE7)
            d = /(.*)[+-]?/gi.exec("" + d)[1];
            whenStr = "" + d;
        }

        tlu.find(".when").html(whenStr);
        tlu.show();

        var fixtures = fixtureData && fixtureData.fixtures;

        if (!fixtures) {
            // can't go further without this
            return;
        }

        tipsListModel.set(tipsModel);
    }

    $.when(tippingService.getCurrentTip(), fixturesService.load({
        startDate: "08-02-2014",
        endDate: "15-02-2014"
    })).then(function (tipsData, fixtureData_) {
        console.log(arguments);
        $(".loading").hide();

        fixtureData = fixtureData_;

        var errors = [];

        if (fixtureData && fixtureData.errors) {
            errors = errors.concat(fixtureData.errors);
            fixtureListModel.set("errors", errors);
        } else {
            fixtureListModel.set(fixtureData);
        }

        if (tipsData && tipsData.errors) {
            errors = errors.concat(tipsData.errors);
            tipsListModel.set("errors", errors);
        } else {
            var result = tipsModel.init(TippingService.createTips(tipsData));
            if (result.errors) {
                alert(result.errors.join("\n"));
            }
            tipsListModel.set(tipsData);
        }

        if (errors.length > 0) {
            showInfo(errors);
        }
    }, function (jqXHR, textStatus, errorThrown) {
        console.log(arguments);
        $(".loading").hide();

        showInfo([{msg: textStatus}]);
    });

    function addTeamClickListener () {
        $(".rounds").on("click", "img", function (evt) {
            if (!tipsListView) {
                return false;
            }
            var fixtureInfo = FixtureListView.getFixtureInfo(this);
            console.log(fixtureInfo, tipsModel);
            var result = tipsModel.add(new FixtureTip(fixtureInfo.fixtureIdx, fixtureInfo.isHome), true);
            tipsListView.pick(result.removed, result.added);
            return false;
        });
    }

    function addPickClickListener () {
        $("button.pick").click(function (evt) {
        console.log(evt, tipsListView);
            if (!tipsListView) {
                return false;
            }
            var tipRound = "1";
            tippingService.makeTip(tipRound, tipsModel.getTipsNames()).done(function (data, textStatus, jqXHR) {
                if (data.errors) {
                    showInfo(data.errors);
                    return;
                }
                showInfo([{msg: "Tip made successfully!"}], "alert-success");
                refreshTip(data.tip);
            });
        });
    }

    addTeamClickListener();
    addPickClickListener();

}

return {
    init: init
};

});
