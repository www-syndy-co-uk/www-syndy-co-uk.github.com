define(["jquery"], function (jQuery) {
    // Bit of a bastard module.
    // Uses jQuery Deferred to let the client wait for YUI to load, before
    // carrying on with TipList drag and drop support.

    var $ = jQuery;
    var Y = null;





    /**
     * Keeps track of which elements have a Y.DD.Drag attached to them, and
     * facilitates removing this drag support from an element.
     */
    function DragManager (constrain) {
        // A Y.DD.Drag datastore
        // 2d array of [home team Y.DD.Drag, away team Y.DD.Drag]
        // one of these arrays for each fixture
        // facilitates removing drag support from home team, away team, or both
        // e.g. to disallow dragging both teams from one fixture into the tips
        var dragTable = {};

        function isHome (li) {
            return 'true' === li.getAttribute('data-home');
        }

        function getFixtureLi (fixtureId, isHome) {
            return Y.Node.all('li[data-fixtureId="' + fixtureId + '"]').filter('[data-home="' + isHome + '"]').item(0);
        }

        function initDrag (fixtureId, isHome) {
            console.log('DragManager.initDrag', fixtureId, isHome);
            var li = getFixtureLi(fixtureId, isHome);
            console.log(li);
            dragTable[fixtureId] = dragTable[fixtureId] || [];
            var drag = dragTable[fixtureId][isHome ? 0 : 1] = new Y.DD.Drag({
                node: li,
                target: {
                    padding: '0 0 0 20'
                }
            }).plug(Y.Plugin.DDProxy, {
                moveOnEnd: false
            });
            if (constrain) {
                drag.plug(Y.Plugin.DDConstrained, {
                    constrain: constrain
                });
            }
        }

        function revokeDrag (fixtureId, isHome) {
            console.log('DragManager.revokeDrag', fixtureId, isHome);
            var drag = dragTable[fixtureId][isHome ? 0 : 1];
            console.log(drag);
            drag.destroy();
        }

        function revokeNonPicks () {
            console.log('DragManager.revokeAll');
            // only revoke non-picks, i.e. those fixture items left in .rounds
            var rounds = Y.one('.rounds');
            Y.each(rounds.all('li[data-fixtureId]'), function (item, idx) {
                var fixtureId = item.getAttribute('data-fixtureId');
                var isHome_ = isHome(item);
                revokeDrag(fixtureId, isHome_);
            });
        }

        this.initDrag = initDrag;
        this.revokeDrag = revokeDrag;
        this.revokeNonPicks = revokeNonPicks;
    }





    /**
     * Keeps track of the remove buttons and the event handling.
     * @param opts.team
     *           The team (li) node. Required.
     * @param opts.eventDelegateContainer
     *           The container that the tip removal clicks should be delegated
     *           on. Optional, defaults to document.body.
     * @param opts.removeTipClickHandler. Required.
     *           YUI event handler.
     */
    function RemoveTipBtn (opts) {
        opts = opts || {};
        var team = opts.team;
        if (!team) {
            throw new Error("team is mandatory");
        }

        // Is it bad to use body? Perhaps, so provide a container!
        var eventDelegateContainer = opts.eventDelegateContainer || document.body;
        var removeTipClickHandler = opts.removeTipClickHandler;
        var $team = $(team);

        if ($team.find(".remove-tip").length > 0) {
            // already added!
            return;
        }

        var $untipBtn = $("<div/>").addClass("remove-tip").css({
            "text-align": "left",
            position: "relative",
            left: 0,
            top: -$team.innerHeight()
        }).append($("<span/>").css({
            background: "red",
            color: "white",
            padding: "2px",
            "font-weight": "bold"
        }).html("X"));

        $team.append($untipBtn[0]);

        if (!RemoveTipBtn.addedClickHandler && removeTipClickHandler) {
            RemoveTipBtn.addedClickHandler = true;
            var compositeHandler = RemoveTipBtn.removeTipClickHandler.bind(this, removeTipClickHandler);
            Y.one(eventDelegateContainer).delegate("click", compositeHandler, "div.remove-tip span");
        }
    }

    RemoveTipBtn.removeTipClickHandler = function (fn, e) {
        e.removeRemoveTipBtn = RemoveTipBtn.removeRemoveTipBtn.bind(this, e);
        try {
            fn.call(this, e);
        } finally {
            // not sure if this cleanup is necessary.
            e.removeRemoveTipBtn = null;
        }
    };

    RemoveTipBtn.removeRemoveTipBtn = function (e) {
        var $target = $(e.target.getDOMNode());
        var $team = $target.closest('[data-fixtureId]');
        $team.find("div.remove-tip").remove();
    };

    RemoveTipBtn.addedClickHandler = false;





    function logInfo (evtName, e) {
        var drag = e.drag,
            drop = e.drop;
        drag = drag ? e.drag.get('node') : null;
        drop = drop ? e.drop.get('node') : null;

        console.log('evtName', evtName);
        console.log('e', e);
        console.log('drag', drag);
        console.log('drop', drop);

        if (drag) {
            var fixtureId = drag.getAttribute('data-fixtureId');
            var isHome = drag.getAttribute('data-home');
            console.log('fixtureId', fixtureId, 'isHome', isHome);
        }
    }





    function TipsList (opts) {

        function initFixtures () {
            var trs = $(fixturesContainer).find(".teams");
            trs.each(function (i) {
                var $tr = $(this);
                var $uls = $tr.find("ul");
                var ulHome = $uls.eq(0);
                var ulAway = $uls.eq(1);
                var liHome = ulHome.find("li");
                var liAway = ulAway.find("li");

                var fixtureId = "" + i;
                Y.each([ulHome, ulAway, liHome, liAway], function (item, idx) {
                    item.attr('data-fixtureId', fixtureId);
                });
                Y.each([ulHome, liHome], function (item, idx) {
                    item.attr('data-home', true);
                });
                Y.each([ulAway, liAway], function (item, idx) {
                    item.attr('data-home', false);
                });

                dragManager.initDrag(fixtureId, true);
                dragManager.initDrag(fixtureId, false);
            });
        }

        /**
         * @param e YUI Event
         */
        function removeTipClickHandler (e) {
            // Stop the event's default behavior
            e.preventDefault();

            // Stop the event from bubbling up the DOM tree
            e.stopPropagation();

            var $target = $(e.target.getDOMNode());
            var $team = $target.closest('[data-fixtureId]');
            var fixtureId = $team.attr('data-fixtureId');
            var isHome = 'true' === $team.attr('data-home');
            console.log($team.first(), fixtureId, isHome);

            // can only remove AFTER we grab the properties we need
            // otherwise the node is GONE!
            e.removeRemoveTipBtn();

            // get the fixtures ul where we return this tip to
            var fixtureEls = $(fixturesContainer).find("ul").filter(function () {
                return fixtureId === $(this).attr("data-fixtureId");
            });
            var fixtureEl = fixtureEls.eq(isHome ? 0 : 1);
            fixtureEl.append($team);

            // enable the other team of this fixture, now both are pickable again
            dragManager.initDrag(fixtureId, !isHome);
        }

        opts = opts || {};

        //Static Vars
        var goingUp = false,
            lastY = 0,
            newDrop = null,
            maxPicks = opts.maxPicks || 3,
            parentSelector = opts.parentSelector || "#play",
            tipsContainer = this.tipsContainer = opts.tipsContainer,
            fixturesContainer = this.fixturesContainer = opts.fixturesContainer,
            tipsDrop = null;

        if (!fixturesContainer) {
            throw new Error("fixturesContainer is mandatory option");
        }
        if (!tipsContainer) {
            throw new Error("tipsContainer is mandatory option");
        }

        var dragManager = new DragManager(parentSelector);
        initFixtures();

        //Create simple targets for the 2 lists.
        var ul = Y.Node.one(tipsContainer).one('ul');
        tipsDrop = new Y.DD.Drop({
            node: ul
        });

        // Listen for all drop:over events
        // Why all? Because otherwise we can't reorder the elements as we drag
        Y.DD.DDM.on('drop:over', function(e) {
            //Get a reference to our drag and drop nodes
            var drag = e.drag.get('node'),
                drop = e.drop.get('node');

            var dropContainer = Y.one(tipsContainer);
            var isChildOfDropContainer = dropContainer.contains(drop);

            if (isChildOfDropContainer) {
                dropContainer.addClass('dragOver');
            }

            //Are we dropping on a li node?
            if (isChildOfDropContainer && drop.test('li')) {
                //Are we not going up?
                if (!goingUp) {
                    drop = drop.get('nextSibling');
                }
                //Add the node to this list
                e.drop.get('node').get('parentNode').insertBefore(drag, drop);
                //Resize this nodes shim, so we can drop on it later.
                e.drop.sizeShim();

                newDrop = drag;
            }
        });

        // Listen for drop:hit on tipsDrop
        tipsDrop.on('drop:hit', function(e) {
            //Get a reference to our drag and drop nodes
            var drag = e.drag.get('node'),
                drop = e.drop.get('node');

            newDrop = drag;

            logInfo('drop:hit', e);
        });

        // Listen for drop:hit on tipsDrop
        tipsDrop.on('drop:exit', function(e) {
            //Get a reference to our drag and drop nodes
            var drag = e.drag.get('node'),
                drop = e.drop.get('node');

            logInfo('drop:exit', e);

            var dropContainer = Y.one(tipsContainer);
            dropContainer.removeClass('dragOver');
        });

        //Listen for all drag:drag events
        Y.DD.DDM.on('drag:drag', function(e) {
            //Get the last y point
            var y = e.target.lastXY[1];
            //is it greater than the lastY var?
            if (y < lastY) {
                //We are going up
                goingUp = true;
            } else {
                //We are going down.
                goingUp = false;
            }
            //Cache for next check
            lastY = y;
        });

        //Listen for all drag:start events
        Y.DD.DDM.on('drag:start', function(e) {
            logInfo('drag:start', e);

            newDrop = null;

            //Get our drag object
            var drag = e.target;
            //Set some styles here
            drag.get('node').setStyle('opacity', '.25');
            drag.get('dragNode').set('innerHTML', drag.get('node').get('innerHTML'));
            drag.get('dragNode').setStyles({
                opacity: '.5',
                borderColor: drag.get('node').getStyle('borderColor'),
                backgroundColor: drag.get('node').getStyle('backgroundColor')
            });
        });

        //Listen for a drag:end events
        Y.DD.DDM.on('drag:end', function(e) {
            var drag = e.target.get('node');
            //Put our styles back
            drag.setStyles({
                visibility: '',
                opacity: '1'
            });

            logInfo('drag:end', e);

            var dropContainer = Y.one(tipsContainer);
            dropContainer.removeClass('dragOver');

            if (newDrop) {
                new RemoveTipBtn({
                    team: drag.getDOMNode(),
                    eventDelegateContainer: "#play",
                    removeTipClickHandler: removeTipClickHandler
                });
            }

            var numPicks = dropContainer.all('li.team').size();
            console.log(numPicks);
            if (numPicks >= maxPicks) {
                dragManager.revokeNonPicks();
                return;
            }

            console.log(newDrop);
            if (newDrop) {
                var fixtureId = drag.getAttribute('data-fixtureId');
                var isHome = 'true' === drag.getAttribute('data-home');
                // we want to stop the other team of this fixture from being dragged.
                dragManager.revokeDrag(fixtureId, !isHome);
            }
        });

        //Listen for all drag:drophit events
        Y.DD.DDM.on('drag:drophit', function(e) {
            var drop = e.drop.get('node'),
                drag = e.drag.get('node');

            //if we are not on an li, we must have been dropped on a ul
            if (drop.get('tagName').toLowerCase() !== 'li') {
                if (!drop.contains(drag)) {
                    drop.appendChild(drag);
                }
            }

            logInfo('drag:drophit', e);
        });
    }

    /**
     * Returns the picks as an array of {fixtureId, isHome} objects.
     */
    TipsList.prototype.getPicks = function () {
        return $.makeArray($(this.tipsContainer).find('.team').map(function () {
            return {
                fixtureId: $(this).attr("data-fixtureId"),
                isHome: "true" === $(this).attr("data-home")
            };
        }));
    };

    /**
     * As this module is a horrible mix of jQuery, YUI and RequireJS, we
     * require some jumping through hoops to ensure everything is loaded.
     * Use $.Deferred so the client can wait for everything to be ready.
     */
    function waitForLoaded () {
        var dfd = $.Deferred();
        YUI().use('dd-constrain', 'dd-proxy', 'dd-drop', 'dd-delegate', function (_Y) {
            Y = _Y;
            dfd.resolve(TipsList);
        });
        return dfd;
    }

    return {
        waitForLoaded: waitForLoaded
    };

});
