define(["jquery", "backbone"], function($, Backbone) {

    var log = function() {
        if (true) return;
        console.log.apply(console, Array.prototype.slice.apply(arguments));
    };

    /**
     * Keeps track of the remove buttons and the event handling.
     * @param opts.el
     *           The node to add the remove button to. Required.
     */
    var RemoveTipBtn = {};

    RemoveTipBtn.reset = function(el, clickHandler) {
        if (!el) {
            throw new Error("el is mandatory");
        }

        var $el = $(el);

        if ($el.find(".remove-tip").length > 0) {
            console.log("already added");
            // already added!
            return;
        }

        var $btn = $("<div/>").addClass("remove-tip").css({
            "text-align": "left",
            position: "relative",
            left: 0,
            top: -$el.innerHeight()
        }).append($("<span/>").css({
            background: "red",
            color: "white",
            padding: "2px",
            "font-weight": "bold"
        }).html("X"));

        $el.append($btn);
        $btn.on("click", function (e) {
            $btn.off("click");
            clickHandler(e);
            $btn.remove();
        });
    };

    var TipsListView = Backbone.View.extend({

        initialize: function(opts) {
            opts = opts || {};
            this.maxPicks = opts.maxPicks || 3;

            var fixturesContainer = opts.fixturesContainer;
            if (!fixturesContainer) {
                throw new Error("fixturesContainer is required");
            }
            this.fixturesContainer = $(fixturesContainer);

            // We'll keep a list of the images that move to and from fixtures/tips for ease
            this.imgs = null;

            this.listenTo(this.model, "change", this.render);
        },

        /**
         * Returns the picks as an array of {fixtureIdx, isHome} objects.
         */
        getPicks: function() {
            return TipsListView.getPicks(this.$el);
        },

        findTipImg: function(tip) {
            var img = this.imgs.filter("img[data-fixtureIdx=" + tip.fixtureIdx + "]").filter("img[data-home=" + tip.isHome + "]").first();
            return img;
        },

        findFixtureCell: function(tip) {
            return this.fixturesContainer.find("tr[data-fixtureIdx=" + tip.fixtureIdx + "]").find("td[data-home=" + tip.isHome + "]")
        },

        /**
         * @param {TipsModel} tips
         */
        render: function () {
            if (!this.imgs) {
                // initialise the list of images
                this.imgs = this.fixturesContainer.find("img[data-fixtureIdx]");
            }

            var data = this.model.attributes.data;
            if (!data) {
                return;
            }
            var tips = data.tips;

            // we can safely clear the element as we've saved the images already
            this.$el.html("");

            // move imgs from fixtures into tips
            if (tips && tips.length > 0) {
                for (var i = 0; i < tips.length; i++) {
                    var tip = tips[i];
                    var img = this.findTipImg(tip);
                    this.$el.append(img);
                }
            }
        },

        /**
         * @param pick {fixtureIdx, isHome}
         *           An object with fixtureIdx and home properties.
         */
        pick: function (oldTip, newTip) {
            var newImg = this.findTipImg(newTip)[0];

            console.log(oldTip, newTip);

            if (oldTip && oldTip.fixtureIdx === newTip.fixtureIdx) {
                // swap
                var oldImg = this.findTipImg(oldTip)[0];
                $(oldImg).after(newImg);
                this.findFixtureCell(oldTip).append(oldImg);
                return;
            }

            if (oldTip) {
                img = this.findTipImg(oldTip);
                console.log(img);
                this.findFixtureCell(oldTip).append(img);
            }

            this.$el.append(newImg);
        }
    });

    /**
     * Returns the picks as an array of {fixtureIdx, isHome} objects.
     */
    TipsListView.getPicks = function(tipsContainer) {
        return $.makeArray($(tipsContainer).find('.team').map(function() {
            return {
                fixtureIdx: parseInt($(this).attr("data-fixtureIdx"), 10),
                isHome: "true" === $(this).attr("data-home")
            };
        }));
    };

    TipsListView.RemoveTipBtn = RemoveTipBtn;

    return TipsListView;

});