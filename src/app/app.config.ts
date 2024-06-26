import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { tokenInterceptor } from './token.interceptor';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNativeDateAdapter } from '@angular/material/core';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
  provideHttpClient(), provideAnimations(),
  provideToastr({ preventDuplicates: true }), 
  provideAnimationsAsync(),
  provideHttpClient(
    withInterceptors([tokenInterceptor]),
  ),
  provideNativeDateAdapter()
]
};
