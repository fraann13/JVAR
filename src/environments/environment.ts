export const environment = {
    production: false,
    parseAppId: (process.env as any)['NG_APP_PARSE_APP_ID'] || 'ID_DE_DESARROLLO_LOCAL',
    parseJsKey: (process.env as any)['NG_APP_PARSE_JS_KEY'] || 'KEY_DE_DESARROLLO_LOCAL',
    parseServerUrl: (process.env as any)['NG_APP_PARSE_URL'] || 'URL_DE_DESARROLLO_LOCAL'
};