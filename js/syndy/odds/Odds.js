define(function() {

    function Odds() {}

    Odds.toString = function(odds) {
        if (!odds) {
            return "?";
        }
        var f = odds.asFraction;
        var d = odds.asDouble;
        if (f) {
            return "" + f.numerator + "/" + f.denominator;
        }
        return d;
    };

    Odds.strToFloat = function(s) {
        var idx = s.indexOf("/");
        if (idx < 0) {
            return parseFloat(s);
        }
        var num = s.substring(0, idx).trim();
        var denom = s.substring(idx + 1).trim();
        return parseInt(num) / parseInt(denom);
    };

    return Odds;

});
