/*globals window, console*/
define(function () {

var root = "http://www.superleague.co.uk/_img/imagesource.php";

var logos = {
"Bradford Bulls" : root + "?image=_club_logos/33440.png&maxwidth=85",
"Castleford Tigers" : root + "?image=_club_logos/33448.png&maxwidth=85",
"Catalan Dragons" : root + "?image=_club_logos/49006.png&maxwidth=85",
"Huddersfield Giants" : root + "?image=_club_logos/33466.png&maxwidth=85",
"Hull FC" : root + "?image=_club_logos/33467.png&maxwidth=85",
"Hull Kingston Rovers" : root + "?image=_club_logos/33512.png&maxwidth=85",
"Leeds Rhinos" : root + "?image=_club_logos/33476.png&maxwidth=85",
"London Broncos" : root + "?image=_club_logos/70341.png&maxwidth=85",
"St. Helens" : root + "?image=_club_logos/33498.png&maxwidth=85",
"Salford City Reds" : root + "?image=_club_logos/33495.png&maxwidth=85",
"Wakefield Wildcats" : root + "?image=_club_logos/33502.png&maxwidth=85",
"Warrington Wolves" : root + "?image=_club_logos/33503.png&maxwidth=85",
"Widnes Vikings" : root + "?image=_club_logos/2.png&maxwidth=85",
"Wigan Warriors" : root + "?image=_club_logos/33507.png&maxwidth=85"
};

logos["Bradford"] = logos["Bradford Bulls"];
logos["Castleford"] = logos["Castleford Tigers"];
logos["Catalans Dragons"] = logos["Catalan Dragons"];
logos["Huddersfield"] = logos["Huddersfield Giants"];
logos["Hull"] = logos["Hull FC"];
logos["Hull K R"] = logos["Hull Kingston Rovers"];
logos["Leeds"] = logos["Leeds Rhinos"];
logos["Salford"] = logos["Salford City Reds"];
logos["St Helens"] = logos["St. Helens"];
logos["Wakefield"] = logos["Wakefield Wildcats"];
logos["Warrington"] = logos["Warrington Wolves"];
logos["Widnes"] = logos["Widnes Vikings"];
logos["Wigan"] = logos["Wigan Warriors"];

return logos;

});
