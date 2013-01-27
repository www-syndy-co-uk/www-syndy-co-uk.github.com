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

function RankingList(sortable, padding, itemsSelector) {

    $( sortable ).sortable({
        items: itemsSelector,
        containment: "document"
    }).disableSelection();

    $( sortable ).bind( "sortstop", function (evt, ui) {
        // ensure there is either >=1 clubs in the list
        // or there is at least padding there to drag clubs into
        var numPicks = sortable.children(itemsSelector).length;
        if (0 == numPicks) {
            console.log("sortstop", sortable, padding);
            sortable.append(padding);
        }
    });

    function canDropTeam (evt, ui) {
        console.log("canDropTeam");
        var picks = sortable.children(itemsSelector);
        var itemPosition = picks.index(ui.item);

        if (!pointInsideElement(evt.pageX, evt.pageY, sortable)) {
            // Not inside the drop target
            return false;
        }

        picks = picks.filter(function (idx) {
            return this.src === ui.item[0].src;
        });

        if (picks.length > 1) {
            // Already picked this
            return false;
        }

        return true;
    }

    $( sortable ).bind( "sortupdate", function (evt, ui) {
        if (!canDropTeam(evt, ui)) {
            ui.item.remove();
            return;
        }

        // remove any padding as we have club elements in here now and don't need the padding
        padding.remove();

        var maxItems = 3;
        var picks = sortable.children(itemsSelector);
        if (picks.length < maxItems + 1) {
            // space to drop
            // picks.length < (maxItems, plus one for this drop item itself)
            return;
        }

        picks.last().remove();
    });

    sortable.append(padding);
}

return RankingList;

});
