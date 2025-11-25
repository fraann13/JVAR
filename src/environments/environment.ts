interface GlobalEnv {
    PARSE_APP_ID: string;
    PARSE_JS_KEY: string;
    PARSE_SERVER_URL: string;
}

const runtimeEnv = (window as any).env || {};

export const environment = {
    production: false,
    
    parseAppId: runtimeEnv.PARSE_APP_ID,
    parseJsKey: runtimeEnv.PARSE_JS_KEY,
    parseServerUrl: runtimeEnv.PARSE_SERVER_URL,
};