define(function() {

    function Odds() {}

    Odds.toString = function(odds) {
        if (!odds) {
            throw new Error("Cannot format " + odds + " as odds.");
        }
        var f = odds.asFraction;
        var d = odds.asDouble;
        if (f && "number" === typeof f.numerator && "number" === typeof f.denominator) {
            return "" + f.numerator + "/" + f.denominator;
        }
        if ("number" === typeof d) {
            return "" + d;
        }
        throw new Error("Cannot format " + odds + " as odds.");
    };

    Odds.strToFloat = function(s) {
        if (!s || "string" !== typeof s) {
            throw new Error("Cannot convert " + s + " to float.");
        }
        var idx = s.indexOf("/");
        if (idx < 0) {
            return parseFloat(s);
        }
        var num = s.substring(0, idx).trim();
        var denom = s.substring(idx + 1).trim();
        return parseInt(num) / parseInt(denom);
    };

    Odds.fractional = function(numerator, denominator) {
        return {
            asFraction: {
                numerator: numerator,
                denominator: denominator
            }
        };
    };

    return Odds;

});
