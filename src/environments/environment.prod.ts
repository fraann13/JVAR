export const environment = {
    production: true,
    parseAppId: (process.env as any).NG_APP_PARSE_APP_ID,
    parseJsKey: (process.env as any).NG_APP_PARSE_JS_KEY,
    parseServerUrl: (process.env as any).NG_APP_PARSE_URL
};