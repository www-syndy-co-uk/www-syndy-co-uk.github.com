window.writelnScript = function(src) {
    document.writeln("<script src='" + src + "'></scr" + "ipt>");
};

window.writelnCSS = function(href) {
    document.writeln("<link rel=stylesheet type=text/css href='" + href + "'>");
};
