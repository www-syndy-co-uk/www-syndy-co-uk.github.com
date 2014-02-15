define([
    "jquery",
    "q"
], function($, Q) {

    // http://forum.jquery.com/topic/jquery-ajax-with-datatype-jsonp-will-not-use-error-callback-if-request-fails

    /**
     * Makes a jQuery ajax call (as JSONP).
     *
     * We need JSONP as we're cross domain (e.g. www.syndy.co.uk calling api.syndy.co.uk).
     *
     * If the JSONP is a success, the data is returned as normal.
     *
     * If there is an error (i.e. there is an "errors" field), we decorate the error with the URL,
     * and throw the error which will trigger the failure callbacks on the returned promise.
     *
     * Why can't we use HTTP status codes to send errors? Why do we need to send back an errors object
     * (with a HTTP 200)?
     *
     * Because JSONP and error callbacks don't play well when cross-domain. We NEED a valid JSON
     * response in order to trigger the callbacks (either success or failure, it doesn't matter).
     *
     * @return A Q promise.
     */
    function getJSON(url, settings) {
        url += (url.indexOf("?") > -1) ? "&" : "?";
        url += "callback=";
        url += "?";
        return Q($.getJSON(url, settings)).then(function(data) {
            data = ("string" === typeof data) ? JSON.parse(data) : data;
            if (data.errors) {
                data.url = url;
                throw data;
            }
            return data;
        });
    }

    return {
        getJSON: getJSON
    };

});
