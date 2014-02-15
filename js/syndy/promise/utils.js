define([
    "q"
], function(Q) {

    /**
     * Resolves the provided promises, and sends out a progress notification for each.
     *
     * @return A Q promise.
     */
    function allSettledAndNotify(promises) {
        function callback(i) {
            return function(response) {
                results[i] = response;
                d.notify({
                    list: results,
                    response: response,
                    i: i,
                    size: size,
                    count: (++count)
                });
            };
        }

        var d = Q.defer();
        var results = [];
        var size = promises.length;
        var count = 0;
        promises = _.map(promises, function(p, i) {
            // save either success response or error response to the list.
            var cb = callback(i);
            return p.then(cb, cb);
        });

        var resolve = function() {
            d.resolve(results);
        };

        Q.allSettled(promises).then(resolve, resolve);
        return d.promise;
    }

    return {
        allSettledAndNotify: allSettledAndNotify
    };

});
