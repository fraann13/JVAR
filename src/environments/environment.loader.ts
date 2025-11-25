export const loadEnv = () => ({
    PARSE_APP_ID: (window as any).__env?.PARSE_APP_ID || '',
    PARSE_JS_KEY: (window as any).__env?.PARSE_JS_KEY || '',
    PARSE_URL: (window as any).__env?.PARSE_URL || '',
});
