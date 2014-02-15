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

// Load JS from different places depending on syndv.dev toggle.
// We use CDN for common libraries when not in dev mode.
// This means when we test we don't need internet connection for CDN.
var paths = !syndy.dev ? {
    script: {
        // non-requirejs paths
        "requirejs": "//cdnjs.cloudflare.com/ajax/libs/require.js/2.1.10/require" + min(),
        "YUI": "http://yui.yahooapis.com/3.14.1/build/yui/yui" + min("-min") + ".js"
    },
    require: {
        // requirejs paths
        "domReady": "//cdnjs.cloudflare.com/ajax/libs/require-domReady/2.0.1/domReady" + min(),
        // 1.11.0 because 2.x does not support IE8
        "jquery": "//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery" + min(),
        "underscore": "//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.5.2/underscore" + min("-min"),
        "backbone": "//cdnjs.cloudflare.com/ajax/libs/backbone.js/1.1.0/backbone" + min("-min"),
        "jqueryui": "//code.jquery.com/ui/1.10.4/jquery-ui" + min(),
        "q": "//cdnjs.cloudflare.com/ajax/libs/q.js/1.0.0/q" + min()
    }
} : {
    script: {
        // non-requirejs paths
        "requirejs": syndy.staticRoot + "/js/lib/require" + min(),
    },
    require: {
        // requirejs paths
        "domReady": "lib/domReady" + min(),
        "jquery": "lib/jquery" + min(),
        "underscore": "lib/underscore" + min("-min"),
        "backbone": "lib/backbone" + min("-min"),
        "q": "lib/q" + min()
    }
};

function makeRequireConfig() {
    return {
        baseUrl: syndy.staticRoot + "/js",
        YUI: {
            src: paths.script.YUI
        },
        paths: paths.require,
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
        // first and most important, requirejs.
        writelnScript(paths.script["requirejs"] + ".js");

        writelnScript(syndy.staticRoot + "/js/CookieManager.js");

        // site css
        writelnCSS(syndy.staticRoot + "/css/template.css");

        // blogger.com widgets JS and widgets CSS overrides
        var widgetsJs = syndy.staticRoot + "/blogger/3790812069-widgets.js";
        var widgetsCss = syndy.staticRoot + "/blogger/1158881256-widget_css_2_bundle.css";
        writelnScript(widgetsJs);
        writelnCSS(widgetsCss);

        // jqueryui
        //writelnCSS("//code.jquery.com/ui/1.10.4/themes/smoothness/jquery-ui" + min() + ".css");
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
    if (!String.prototype.hasOwnProperty("trim")) writelnScript(syndy.staticRoot + "/js/lib/es5-shim.js");
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
