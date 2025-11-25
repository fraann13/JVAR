import * as process from 'process';
import { EventEmitter } from 'events'; 
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

(window as any).process = process;
(window as any).EventEmitter = EventEmitter;

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
  