import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { ParseService } from './services/parse.service'; 

export function initializeParse(parseService: ParseService): () => void {
  return () => {}; 
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeParse,
      deps: [ParseService], 
      multi: true
    }
  ]
};