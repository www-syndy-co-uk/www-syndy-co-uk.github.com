define([], function() {

    function indexOf(arr, predicate) {
        for (var i = 0; i < arr.length; i++) {
            if (predicate(arr[i], i, arr)) {
                return i;
            }
        }
        return -1;
    }

    function swapNodes(a, b) {
        var aparent = a.parentNode;
        var asibling = a.nextSibling === b ? a : a.nextSibling;
        b.parentNode.insertBefore(a, b);
        aparent.insertBefore(b, asibling);
    }

    return {
        indexOf: indexOf,
        swapNodes: swapNodes
    };

});