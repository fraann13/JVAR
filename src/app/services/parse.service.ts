import { Injectable } from '@angular/core';
import Parse from 'parse';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ParseService {
    constructor() {
        const appId = environment.parseAppId;
        const jsKey = environment.parseJsKey;
        const serverUrl = environment.parseServerUrl;

        Parse.initialize(appId, jsKey);
        (Parse as any).serverURL = serverUrl;
    }
}
