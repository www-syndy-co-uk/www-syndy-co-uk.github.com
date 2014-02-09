/*global window, alert*/
define(["underscore", "utils"], function(_, utils) {

    /**
     * A Tip, as transported to/from backend.
     */
    function Tip(name, hcap, odds) {
        this.name = name;
        this.hcap = hcap;
        this.odds = odds;
    }

    /**
     * A Tip, relative to a set of fixtures.
     * @param {num} fixtureIdx
     * @param {boolean} isHome
     */
    function FixtureTip(fixtureIdx, isHome, tip) {
        this.fixtureIdx = fixtureIdx;
        this.isHome = isHome;
    }

    FixtureTip.prototype.equals = function(ob) {
        return ob && this.fixtureIdx === ob.fixtureIdx && this.isHome === ob.isHome;
    };

    FixtureTip.prototype.getTipName = function(fixtures) {
        var f = fixtures[this.fixtureIdx];
        return this.isHome ? f.team1 : f.team2;
    };

    function findTeamInFixtures(team, fixtures) {
        var lc = team.toLowerCase();
        return utils.indexOf(fixtures, function(item) {
            return lc === item.team1.toLowerCase() || lc === item.team2.toLowerCase();
        });
    }

    function findMatchingFixture(fixtureTip, fixtureTips) {
        return utils.indexOf(fixtureTips, function(item) {
            return fixtureTip.fixtureIdx === item.fixtureIdx;
        });
    }

    function createDefaultTipsValidator(fixtures, expectedNumTips) {
        return function createDefaultTipsValidator(tips) {
            var errors = [];
            if (tips.length !== expectedNumTips) {
                errors.push("Expected " + expectedNumTips + " tips, but there were " + tips.length);
            }
            return errors;
        };
    }

    /**
     * @param {Object} opts The model options.
     *                 opts.fixtures: The fixtures to allow tips for.
     *                 opts.maxTips: The maximum number of tips.
     *                 opts.rotateTips: Set to true if a new tip replaces an old tip when maxTips is reached.
     */
    function TipsModel(opts) {
        opts = opts || {};

        this.maxTips = opts.maxTips || 3;

        this.rotateTips = (false === opts.rotateTips) ? false : true;

        // FixtureTip[]
        this.tips = [];

        this.fixtures = opts.fixtures;

        this.tipsValidator = createDefaultTipsValidator(this.fixtures, this.maxTips);
    }

    /**
     * @param {Tip[]} tips.
     */
    TipsModel.prototype.init = function(tips) {
        var errors = [];
        this.tips = [];
        for (var i = 0; i < tips.length; i++) {
            var tipName = tips[i].name;
            var fixtureIdx = findTeamInFixtures(tipName, this.fixtures);
            if (fixtureIdx < 0) {
                errors.push("Tip: " + tipName + " not found in fixtures");
                continue;
            }
            var isHome = this.fixtures[fixtureIdx].team1.toLowerCase() === tipName.toLowerCase();
            this.tips.push(new FixtureTip(fixtureIdx, isHome));
        }
        if (errors.length > 0) {
            return {
                errors: errors
            };
        }
        return {};
    };

    TipsModel.prototype.validate = function() {
        return this.tipsValidator(this.tips);
    };

    /**
     * @param {FixtureTip} fixtureTip.
     * @param {boolean} replaceForFixture Set to true if you want to replace an existing tip with this tip,
     *                  if this new tip is for the same fixture.
     */
    TipsModel.prototype.add = function(fixtureTip, replaceForFixture) {
        var result = {};

        replaceForFixture = true === replaceForFixture;

        var fixtureIdx = findMatchingFixture(fixtureTip, this.tips);
        if (fixtureIdx > -1) {
            if (!replaceForFixture) {
                return {
                    errors: [{
                        duplicateFixture: fixtureTip
                    }]
                };
            }

            // swap old add new
            result.removed = this.tips[fixtureIdx];
            result.added = this.tips[fixtureIdx] = fixtureTip;
            return result;
        }

        if (this.tips.length >= this.maxTips) {
            // remove head, add new tip to end
            result.removed = this.tips[0];
            this.tips = this.tips.slice(this.tips.length - this.maxTips + 1);
            this.tips.push(fixtureTip);
            result.added = fixtureTip;
            return result;
        }

        // normal add.
        this.tips.push(fixtureTip);
        result.added = fixtureTip;

        return result;
    };

    TipsModel.prototype.getTipsNames = function() {
        return _.map(this.tips, function(tip) {
            return tip.getTipName(this.fixtures);
        }, this);
    };

    TipsModel.FixtureTip = FixtureTip;
    TipsModel.Tip = Tip;
    TipsModel.findTeamInFixtures = findTeamInFixtures;
    TipsModel.findMatchingFixture = findMatchingFixture;

    return TipsModel;

});
