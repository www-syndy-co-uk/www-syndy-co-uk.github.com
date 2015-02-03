define(["underscore"], function(_) {

    var aliases = {
        "Bradford Bulls": ["Bradford"],
        "Castleford Tigers": ["Castleford"],
        "Catalan Dragons": ["Catalans", "Catalans Dragons"],
        "Huddersfield Giants": ["Huddersfield"],
        "Hull FC": ["Hull"],
        "Hull Kingston Rovers": ["Hull K R", "Hull KR"],
        "Leeds Rhinos": ["Leeds"],
        "London Broncos": ["London"],
        "Salford Red Devils": ["Salford"],
        "St. Helens": ["St Helens"],
        "Wakefield Wildcats": ["Wakefield"],
        "Warrington Wolves": ["Warrington"],
        "Widnes Vikings": ["Widnes"],
        "Wigan Warriors": ["Wigan"]
    };

    function setForAllAliases(map) {
        _.each(aliases, function(value, key) {
            _.each(value, function(alias) {
                map[alias] = map[key];
            });
        });
    }

    function TeamIcons() {
        var icons = this.icons = {};
        var css = this.css = {};

        var iconPrefix = "http://upload.wikimedia.org/wikipedia/commons/thumb";

        icons["Bradford Bulls"] = "/e/eb/Bullscolours.svg/16px-Bullscolours.svg.png";
        icons["Castleford Tigers"] = "/f/fd/Castleford_colours.svg/16px-Castleford_colours.svg.png";
        icons["Catalan Dragons"] = "/0/0c/Catalanscolours.svg/16px-Catalanscolours.svg.png";
        icons["Huddersfield Giants"] = "/7/73/Giantscolours.svg/16px-Giantscolours.svg.png";
        icons["Hull FC"] = "/6/65/Hullcolours.svg/16px-Hullcolours.svg.png";
        icons["Hull Kingston Rovers"] = "/8/8f/HKRcolours.svg/16px-HKRcolours.svg.png";
        icons["Leeds Rhinos"] = "/5/5f/Rhinoscolours.svg/16px-Rhinoscolours.svg.png";
        icons["London Broncos"] = "/f/f8/Quinscolours.svg/16px-Quinscolours.svg.png";
        icons["Salford Red Devils"] = "/8/81/Redscolours.svg/16px-Redscolours.svg.png";
        icons["St. Helens"] = "/5/5e/Saintscolours.svg/16px-Saintscolours.svg.png";
        icons["Wakefield Wildcats"] = "/e/e8/Wcatscolours.svg/16px-Wcatscolours.svg.png";
        icons["Warrington Wolves"] = "/f/fd/Wolvescolours.svg/16px-Wolvescolours.svg.png";
        icons["Widnes Vikings"] = "/e/ec/Widnes_colours.svg/16px-Widnes_colours.svg.png";
        icons["Wigan Warriors"] = "/c/c0/Wigancolours.svg/16px-Wigancolours.svg.png";

        _.each(icons, function(value, key) {
            icons[key] = iconPrefix + value;
        });

        setForAllAliases(icons);

        css["Bradford Bulls"] = "Bulls";
        css["Castleford Tigers"] = "Castleford";
        css["Catalan Dragons"] = "Catalans";
        css["Huddersfield Giants"] = "Giants";
        css["Hull FC"] = "Hull";
        css["Hull Kingston Rovers"] = "HKR";
        css["Leeds Rhinos"] = "Rhinos";
        css["London Broncos"] = "Broncos";
        css["Salford Red Devils"] = "Reds";
        css["St. Helens"] = "Saints";
        css["Wakefield Wildcats"] = "Wcats";
        css["Warrington Wolves"] = "Wolves";
        css["Widnes Vikings"] = "Widnes";
        css["Wigan Warriors"] = "Wigan";

        _.each(css, function(value, key) {
            css[key] = "sprite_16px-" + value + "_colours";
        });

        setForAllAliases(css);
    }

    TeamIcons.prototype.getIconUrl = function(teamName) {
        return this.icons[teamName];
    };

    TeamIcons.prototype.getIconClass = function(teamName) {
        return this.css[teamName];
    };

    TeamIcons.prototype.keys = function() {
        return _.keys(this.icons);
    };

    return TeamIcons;

});
