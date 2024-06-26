
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

export const authguardGuard: CanActivateFn = (route, state) => {
  const _router = inject(Router);
  const _AuthService=inject(AuthService)
  const toster=inject(ToastrService)

  if (!localStorage.getItem('token') && !_AuthService.isAuthenticatedFn()) {
    toster.error("Please login first")
    _router.navigate(["login"]);
    return false;
  }

  return true;
};

