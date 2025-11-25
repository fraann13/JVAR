// src/environments/environment.prod.ts
export const environment = {
    production: true,
    // Asegúrate de que los nombres coincidan exactamente con lo que definiste en Vercel
    parseAppId: (process.env as any)['NG_APP_PARSE_APP_ID'],
    parseJsKey: (process.env as any)['NG_APP_PARSE_JS_KEY'],
    parseServerUrl: (process.env as any)['NG_APP_PARSE_URL']
};