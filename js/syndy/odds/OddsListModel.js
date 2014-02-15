define(["backbone", "./MarketModel"], function(Backbone, MarketModel) {

    var OddsListModel = Backbone.Collection.extend({

        model: MarketModel

    });

    return OddsListModel;

});
