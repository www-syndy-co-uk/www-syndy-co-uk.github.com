/*globals window, console*/
define(function () {

    //var root = "http://www.superleague.co.uk/_img/imagesource.php";
    //var root = "http://static." + window.location.host.match(/\w+\.(.*)/)[1] + "/img/logos/teams/85/";

    var arr = [
    "http://3.bp.blogspot.com/-Kw8Pt1vVKsc/UQVpZWH2nNI/AAAAAAAAABo/siH-GXEwsiA/s1600/33440.png",
    "http://2.bp.blogspot.com/-Vdo5euWulUQ/UQVpZk-U_YI/AAAAAAAAAB0/ahAUYU-3cno/s1600/33448.png",
    "http://1.bp.blogspot.com/-Y-yZWbiAPw8/UQVptXhsAII/AAAAAAAAADs/2W2XsTZkweY/s1600/49006.png",
    "http://1.bp.blogspot.com/-9ACBoVogUZk/UQVpZ5judPI/AAAAAAAAACA/U7xTMTcJu-Y/s1600/33466.png",
    "http://4.bp.blogspot.com/-T-9fiBpQgBc/UQVpaosS5aI/AAAAAAAAACM/r0Lo1Sv_PKY/s1600/33467.png",
    "http://2.bp.blogspot.com/-uGuWBEts0ts/UQVps9Xj0dI/AAAAAAAAADg/ZVeBblT_TwE/s1600/33512.png",
    "http://2.bp.blogspot.com/-7IW2QbX7Pb4/UQVpjxOn4OI/AAAAAAAAACY/EB6MNBJxt28/s1600/33476.png",
    "http://2.bp.blogspot.com/-oRgwA56OLO8/UQVpuOz2MSI/AAAAAAAAAD4/bUSqmdKs1mY/s1600/70341.png",
    "http://2.bp.blogspot.com/-QCEXAgnJCLU/UQVpk-6jchI/AAAAAAAAACw/yjEJ3bMAZIo/s1600/33498.png",
    "http://2.bp.blogspot.com/-hGnNzNM4n4Q/UQVpkAPCKSI/AAAAAAAAACk/3R-ZasepSJk/s1600/33495.png",
    "http://1.bp.blogspot.com/-RZnLP4htMlY/UQVplSHkqOI/AAAAAAAAAC8/rexag81C7GQ/s1600/33502.png",
    "http://4.bp.blogspot.com/-xDINdLgLxmk/UQVpl9_xukI/AAAAAAAAADI/tBrmoiIZ7VI/s1600/33503.png",
    "http://1.bp.blogspot.com/-IplJ2WAod3Y/UQVpYjITLQI/AAAAAAAAABc/WU4a7b6_ZEQ/s1600/2.png",
    "http://4.bp.blogspot.com/-amALafvKGKA/UQVpsJn4wuI/AAAAAAAAADU/y4SSaaJ6mMI/s1600/33507.png"
    ];

    var teams = [
    "Bradford Bulls",
    "Castleford Tigers",
    "Catalan Dragons",
    "Huddersfield Giants",
    "Hull FC",
    "Hull Kingston Rovers",
    "Leeds Rhinos",
    "London Broncos",
    "St. Helens",
    "Salford City Reds",
    "Wakefield Wildcats",
    "Warrington Wolves",
    "Widnes Vikings",
    "Wigan Warriors"
    ];

    var logos = {};
    for (var i = 0; i < arr.length; i++) {
        logos[teams[i]] = arr[i];
    }

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
