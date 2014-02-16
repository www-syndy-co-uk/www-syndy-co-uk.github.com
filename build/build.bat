@echo off

set RJS_BAT_DIR=%~dp0
set RJS_BASE_URL=%RJS_BAT_DIR%..\js

set r_js_shared_opts=-o baseUrl=%RJS_BASE_URL% name=main paths.jquery=empty: paths.underscore=empty: paths.backbone=empty: paths.jqueryui=empty: paths.q=empty:

set TEMP_FILE=temp.js

call r.js.cmd %r_js_shared_opts% out=%TEMP_FILE% optimize=none 

rem copy /b js\blogger\head.js+temp.js built.js
copy /b %TEMP_FILE% %RJS_BAT_DIR%..\built.js

call r.js.cmd %r_js_shared_opts% out=%TEMP_FILE%

rem copy /b js\blogger\head.js+temp.js built.min.js
copy /b %TEMP_FILE% %RJS_BAT_DIR%..\built.min.js

del %TEMP_FILE%
