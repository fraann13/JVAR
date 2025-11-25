export const environment = {
    production: false,
    // Accede a ellas a través de process.env, que será inyectado por el bundler
    parseAppId: (process.env as any)['NG_APP_PARSE_APP_ID'] || 'DEV_APP_ID',
    parseJsKey: (process.env as any)['NG_APP_PARSE_JS_KEY'] || 'DEV_JS_KEY',
    parseServerUrl: (process.env as any)['NG_APP_PARSE_URL'] || 'http://localhost:1337/parse'
};