(function() {

function exposeImportHelpers() {
    window.writelnScript = function(src) {
        document.writeln("<script src='" + src + "'></scr" + "ipt>");
    };

    window.writelnCSS = function(href) {
        document.writeln("<link rel=stylesheet type=text/css href='" + href + "'>");
    };
}

function min(minStr, isMin) {
    if ("undefined" === typeof isMin) {
        isMin = !syndy.debug;
    }
    minStr = minStr || ".min";
    return (!isMin ? "" : minStr);
}

function makeRequireConfig() {
    return {
        baseUrl: syndy.staticRoot + "/js",
        YUI: {
            src: "http://yui.yahooapis.com/3.14.1/build/yui/yui" + min("-min") + ".js"
        },
        paths: {
            // 1.11.0 because 2.x does not support IE8
            "jquery": "//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery" + min(),
            "underscore": "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore" + min("-min"),
            "backbone": "//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.0/backbone" + min("-min")
        },
        shim: {
            underscore: {
                exports: "_"
            },
            backbone: {
                deps: ["underscore", "jquery"],
                exports: "Backbone"
            }
        }
    };
}

function importScriptAndCss() {
    try {
        writelnScript("//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.10/require" + min() + ".js");
        writelnScript(syndy.staticRoot + "/js/CookieManager.js");
        // site css
        writelnCSS(syndy.staticRoot + "/css/template.css");
        // blogger.com widgets JS and widgets CSS overrides
        var widgetsJs = syndy.staticRoot + "/blogger/3790812069-widgets.js";
        var widgetsCss = syndy.staticRoot + "/blogger/1158881256-widget_css_2_bundle.css";
        writelnScript(widgetsJs);
        writelnCSS(widgetsCss);
    } catch (e) {
        alert(e);
    }
}

function fakeConsole(isDebug) {
    if (!window.console) {
        // if there's no console, create a dummy and mark it
        (window["console"] = {}).fake = true;
    }
    if (console.fake) {
        // if the console is fake, bring in log4javascript
        console.log4javascript = true;
        writelnScript("//cdnjs.cloudflare.com/ajax/libs/log4javascript/1.4.3/log4javascript.js");
    }

    // New script block to allow log4javascript to load.
    if (true !== console.fake) {
        return;
    }

    var bind = function(func, scope)
    {
        return function()
        {
            (/** @type {Function} */ func).apply(scope, arguments);
        };
    };

    function noop () {}

    // only use log4javascript if it's present AND we're explicitly debugging
    var log = (isDebug && window["log4javascript"]) ? log4javascript.getDefaultLogger() : null;

    console.log = log ? bind(log.info, log) : noop;
    console.debug = log ? bind(log.debug, log) : noop;
    console.info = log ? bind(log.info, log) : noop;
    console.warn = log ? bind(log.warn, log) : noop;
    console.error = log ? bind(log.error, log) : noop;
}

function fakeJSON() {
    if (!window["JSON"]) writelnScript("//cdnjs.cloudflare.com/ajax/libs/json2/20130526/json2" + min() + ".js");
}

function fakeStringTrim() {
    // Need to use our own non-AMD es5-shim.js when importing this way.
    if (!String.prototype.hasOwnProperty("trim")) writelnScript(syndy.staticRoot + "/js/es5-shim.js");
}

function fakeStringEndsWith() {
    if (!String.prototype.hasOwnProperty("endsWith")) {
        String.prototype.endsWith = function(suffix) {
            return this.indexOf(suffix, this.length - suffix.length) !== -1;
        };
    }
}

exposeImportHelpers();
require = makeRequireConfig();
importScriptAndCss();
fakeConsole(syndy.debug);
fakeJSON();
fakeStringTrim();
fakeStringEndsWith();

}());
