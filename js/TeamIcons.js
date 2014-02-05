define(["underscore"], function(_) {

    function TeamIcons() {
        var icons = this.icons = {};
        var iconPrefix = "http://upload.wikimedia.org/wikipedia/commons/thumb";

        icons["Bradford Bulls"] = "/e/eb/Bullscolours.svg/16px-Bullscolours.svg.png";
        icons["Castleford Tigers"] = "/f/fd/Castleford_colours.svg/16px-Castleford_colours.svg.png";
        icons["Catalan Dragons"] = "/0/0c/Catalanscolours.svg/16px-Catalanscolours.svg.png";
        icons["Huddersfield Giants"] = "/7/73/Giantscolours.svg/16px-Giantscolours.svg.png";
        icons["Hull FC"] = "/6/65/Hullcolours.svg/16px-Hullcolours.svg.png";
        icons["Hull Kingston Rovers"] = "/8/8f/HKRcolours.svg/16px-HKRcolours.svg.png";
        icons["Leeds Rhinos"] = "/5/5f/Rhinoscolours.svg/16px-Rhinoscolours.svg.png";
        icons["London Broncos"] = "/f/f8/Quinscolours.svg/16px-Quinscolours.svg.png";
        icons["Harlequins RL"] = "/f/f8/Quinscolours.svg/16px-Quinscolours.svg.png";
        icons["Salford Red Devils"] = "/8/81/Redscolours.svg/16px-Redscolours.svg.png";
        icons["St. Helens"] = "/5/5e/Saintscolours.svg/16px-Saintscolours.svg.png";
        icons["Wakefield Wildcats"] = "/e/e8/Wcatscolours.svg/16px-Wcatscolours.svg.png";
        icons["Warrington Wolves"] = "/f/fd/Wolvescolours.svg/16px-Wolvescolours.svg.png";
        icons["Widnes Vikings"] = "/e/ec/Widnes_colours.svg/16px-Widnes_colours.svg.png";
        icons["Wigan Warriors"] = "/c/c0/Wigancolours.svg/16px-Wigancolours.svg.png";
        _.each(icons, function(value, key) {
            icons[key] = iconPrefix + value;
        });

        icons["Bradford"] = icons["Bradford Bulls"];
        icons["Castleford"] = icons["Castleford Tigers"];
        icons["Catalans Dragons"] = icons["Catalan Dragons"];
        icons["Huddersfield"] = icons["Huddersfield Giants"];
        icons["Hull"] = icons["Hull FC"];
        icons["Hull K R"] = icons["Hull Kingston Rovers"];
        icons["Leeds"] = icons["Leeds Rhinos"];
        icons["Salford"] = icons["Salford Red Devils"];
        icons["St Helens"] = icons["St. Helens"];
        icons["Wakefield"] = icons["Wakefield Wildcats"];
        icons["Warrington"] = icons["Warrington Wolves"];
        icons["Widnes"] = icons["Widnes Vikings"];
        icons["Wigan"] = icons["Wigan Warriors"];
    }

    TeamIcons.prototype.getIconUrl = function(teamName) {
        return this.icons[teamName];
    };

    TeamIcons.prototype.keys = function() {
        return _.keys(this.icons);
    };

    return TeamIcons;

});