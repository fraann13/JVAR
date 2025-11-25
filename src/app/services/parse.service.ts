import { Injectable } from '@angular/core';
import Parse from 'parse';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ParseService {
    constructor() {
        Parse.initialize(environment.parseAppId, environment.parseJsKey);
        (Parse as any).serverURL = environment.parseServerUrl;
    }
}
