import { Injectable } from '@angular/core';
import Parse from 'parse';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ParseService {
    constructor() {

        // Valores locales (development)
        const localAppId = environment.parseAppId;
        const localJsKey = environment.parseJsKey;
        const localServerUrl = environment.parseServerUrl;

        // Valores de producción (Vercel)
        const prodAppId = (window as any).__env__?.PARSE_APP_ID;
        const prodJsKey = (window as any).__env__?.PARSE_JS_KEY;
        const prodServerUrl = (window as any).__env__?.PARSE_SERVER_URL;

        // Tomar primero las env vars de producción, y si no existen, usar las locales
        const appId = prodAppId || localAppId;
        const jsKey = prodJsKey || localJsKey;
        const serverUrl = prodServerUrl || localServerUrl;

        Parse.initialize(appId, jsKey);
        (Parse as any).serverURL = serverUrl;
    }
}
