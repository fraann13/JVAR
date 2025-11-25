echo "window.env = {" > ./public/env.js
echo "  PARSE_APP_ID: \"$NG_APP_PARSE_APP_ID\"," >> ./public/env.js
echo "  PARSE_JS_KEY: \"$NG_APP_PARSE_JS_KEY\"," >> ./public/env.js
echo "  PARSE_SERVER_URL: \"$NG_APP_PARSE_URL\"" >> ./public/env.js
echo "};" >> ./public/env.js