/*globals window, console*/
define(["jquery"], function (jQuery) {

var $ = jQuery;
var _ = window["_"];

function pointInsideElement (x, y, el) {
    var offset = el.offset();
    var size = { width: el.width(), height: el.height() };
    var dx = (x - offset.left);
    var dy = (y - offset.top);
    return (dx >= 0 && dx < size.width && dy >= 0 && dy < size.height);
}

function RankingList(sortable, padding, itemsSelector, itemIdentityFunction) {

    $( sortable ).sortable({
        items: itemsSelector,
        containment: "document",
        placeholder: "placeholder",
        helper: "clone"
    }).disableSelection();

    $( sortable ).bind( "sortover", function(evt, ui) {
        console.log("sortover");
        if (!ui.item.hasClass("picked")) {
            console.log("sortover", "Already picked");
            //sortable.removeClass("empty");
            //sortable.addClass("hover");
        }
    });

    $( sortable ).bind( "sortout", function(evt, ui) {
        console.log("sortout");
        //sortable.removeClass("hover");
        var count = sortable.find(".picked").length;
        console.log("count", count);
        if (count < 1) {
            console.log("sortout", count, "picks");
            sortable.addClass("empty");
            sortable.append(padding);
        }
    });

    $( sortable ).bind( "sortstart", function(evt, ui) {
        var $src = $(evt.srcElement);
        var $to = $(evt.toElement);
        var w = Math.max(ui.item.width(), $src.width(), $to.width());
        var h = Math.max(ui.item.height(), $src.height(), $to.height());
        //console.log("evt", evt, "ui", ui, "ui.item", ui.item);
        //console.log("$src", $src.width(), $src.height());
        //console.log("$to", $to.width(), $to.height());
        //console.log("ui.item", ui.item.width(), ui.item.height());
        //console.log("ui.placeholder", ui.placeholder, ui.placeholder.width(), ui.placeholder.height());
        //console.log("src", evt.srcElement, "to", evt.toElement);
        //console.log("src===to", evt.srcElement === evt.toElement, "ui.item===src", ui.item === evt.srcElement);
        ui.placeholder.width(w).height(h);
    });

    function isAlreadyPicked (evt, ui) {
        var picks = sortable.find(itemsSelector);
        //console.log("picks.length=" + picks.length);

        var identity = itemIdentityFunction(ui.item);
        //console.log(identity);
        picks = picks.filter(function () {
            var i = itemIdentityFunction(this);
            //console.log(i);
            return i === identity;
        });

        // why > 1?
        // because the element is alread dropped, so we check for duplicates.
        // and the padding is only hidden, so that's there.
        //console.log("picks.length=" + picks.length);
        return (picks.length > 1);
    }

    $( sortable ).bind( "sortupdate", function (evt, ui) {
        console.log("sortupdate");
        var alreadyPicked = isAlreadyPicked(evt, ui);
        if (alreadyPicked) {
            console.log("Already picked");
            ui.item.remove();
            return;
        }

        // remove any padding as we have club elements in here now and don't need the padding
        console.log("remove padding, clear empty class, add picked class");
        padding.remove();
        sortable.removeClass("empty");
        ui.item.addClass("picked");

        console.log("check num picked items");
        var maxItems = 3;
        var picks = sortable.find(itemsSelector);
        var count = picks.length;
        console.log("count", count);
        if (count < maxItems + 1) {
            // space to drop
            // picks.length < (maxItems, plus one for this drop item itself)
            return;
        }

        picks.last().remove();
    });
}

return RankingList;

});
