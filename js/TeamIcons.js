define(function() {

    function TeamIcons() {
        var icons = {};
        var iconPrefix = "http://upload.wikimedia.org/wikipedia/commons/thumb";
        icons["Bradford Bulls"] = iconPrefix + "/e/eb/Bullscolours.svg/16px-Bullscolours.svg.png";
        icons["Castleford Tigers"] = iconPrefix + "/f/fd/Castleford_colours.svg/16px-Castleford_colours.svg.png";
        icons["Catalan Dragons"] = iconPrefix + "/0/0c/Catalanscolours.svg/16px-Catalanscolours.svg.png";
        icons["Huddersfield Giants"] = iconPrefix + "/7/73/Giantscolours.svg/16px-Giantscolours.svg.png";
        icons["Hull FC"] = iconPrefix + "/6/65/Hullcolours.svg/16px-Hullcolours.svg.png";
        icons["Hull Kingston Rovers"] = iconPrefix + "/8/8f/HKRcolours.svg/16px-HKRcolours.svg.png";
        icons["Leeds Rhinos"] = iconPrefix + "/5/5f/Rhinoscolours.svg/16px-Rhinoscolours.svg.png";
        icons["London Broncos"] = iconPrefix + "/f/f8/Quinscolours.svg/16px-Quinscolours.svg.png";
        icons["Harlequins RL"] = iconPrefix + "/f/f8/Quinscolours.svg/16px-Quinscolours.svg.png";
        icons["Salford City Reds"] = iconPrefix + "/8/81/Redscolours.svg/16px-Redscolours.svg.png";
        icons["St. Helens"] = iconPrefix + "/5/5e/Saintscolours.svg/16px-Saintscolours.svg.png";
        icons["Wakefield Wildcats"] = iconPrefix + "/e/e8/Wcatscolours.svg/16px-Wcatscolours.svg.png";
        icons["Warrington Wolves"] = iconPrefix + "/f/fd/Wolvescolours.svg/16px-Wolvescolours.svg.png";
        icons["Widnes Vikings"] = iconPrefix + "/e/ec/Widnes_colours.svg/16px-Widnes_colours.svg.png";
        icons["Wigan Warriors"] = iconPrefix + "/c/c0/Wigancolours.svg/16px-Wigancolours.svg.png";

        icons["Bradford"] = icons["Bradford Bulls"];
        icons["Castleford"] = icons["Castleford Tigers"];
        icons["Catalans Dragons"] = icons["Catalan Dragons"];
        icons["Huddersfield"] = icons["Huddersfield Giants"];
        icons["Hull"] = icons["Hull FC"];
        icons["Hull K R"] = icons["Hull Kingston Rovers"];
        icons["Leeds"] = icons["Leeds Rhinos"];
        icons["Salford"] = icons["Salford City Reds"];
        icons["St Helens"] = icons["St. Helens"];
        icons["Wakefield"] = icons["Wakefield Wildcats"];
        icons["Warrington"] = icons["Warrington Wolves"];
        icons["Widnes"] = icons["Widnes Vikings"];
        icons["Wigan"] = icons["Wigan Warriors"];

        this.getIconUrl = function(teamName) {
            return icons[teamName];
        };
    }

    return TeamIcons;

});