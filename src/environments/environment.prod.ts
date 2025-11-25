export const environment = {
    production: true,
    // La sintaxis 'process.env as any' debería ser reemplazada por el valor durante el build
    parseAppId: (process.env as any)['NG_APP_PARSE_APP_ID'],
    parseJsKey: (process.env as any)['NG_APP_PARSE_JS_KEY'],
    parseServerUrl: (process.env as any)['NG_APP_PARSE_URL']
};