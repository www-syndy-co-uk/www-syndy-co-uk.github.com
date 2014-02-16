define([
    "underscore"
], function(_) {

    function compile(template) {
        if ("string" === typeof template) {
            // nothing
        } else if (!template) {
            // not a string, and falsey
            throw new Error("Cannot compile template from " + template);
        } else if ("function" === typeof template.html) {
            // jQuery
            // MUST use .html().trim() to work in IE.
            template = template.html().trim();
        } else {
            // don't know how to handle.
            throw new Error("Cannot compile template from " + template);
        }
        return _.template(template);
    }

    return {
        compile: compile
    };

});
