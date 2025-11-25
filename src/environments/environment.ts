export const environment = {
    production: false,
    parseAppId: import.meta.env.VITE_PARSE_APP_ID || '',
    parseJsKey: import.meta.env.VITE_PARSE_JS_KEY || '',
    parseServerUrl: import.meta.env.VITE_PARSE_URL || ''
};
