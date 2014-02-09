@echo off

set r_js_shared_opts=-o baseUrl=js name=main paths.jquery=empty: paths.underscore=empty: paths.backbone=empty: paths.jqueryui=empty:

call r.js.cmd %r_js_shared_opts% out=temp.js optimize=none 

rem copy /b js\blogger\head.js+temp.js built.js
copy /b temp.js built.js

call r.js.cmd %r_js_shared_opts% out=temp.js

rem copy /b js\blogger\head.js+temp.js built.min.js
copy /b temp.js built.min.js

del temp.js
