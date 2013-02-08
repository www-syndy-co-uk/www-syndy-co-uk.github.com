/*global syndy */
// site css
document.writeln("<link rel=stylesheet type=text/css href='" + syndy.staticRoot + "/css/template.css'>");
// blogger.com widgets JS and widgets CSS overrides
var widgetsJs = syndy.staticRoot + "/blogger/3790812069-widgets.js";
var widgetsCss = syndy.staticRoot + "/blogger/1158881256-widget_css_2_bundle.css";
document.writeln("<script src='" + widgetsJs + "'></scr" + "ipt>");
document.writeln("<link rel=stylesheet type=text/css href='" + widgetsCss + "'>");

// http://www.quirksmode.org/js/cookies.html
window["CookieManager"] = window["CookieManager"] || (function () {

function createCookie(name,value,days) {
    var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		expires = "; expires="+date.toGMTString();
	}
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}

var cm = {};
cm.createCookie = createCookie;
cm.readCookie = readCookie;
cm.eraseCookie = eraseCookie;
return cm;
}());
