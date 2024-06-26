import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
    const router=inject(Router)
    const toster=inject(ToastrService)
    const authToken=localStorage.getItem('token')
    const authReq=req.clone({
      headers: authToken ? req.headers.set('Authorization', authToken) : req.headers}
    )
    return next(authReq).pipe(
      catchError((error) => {
        if (error.status === 401) {
          toster.error("Unauthorized access")
          console.error('Unauthorized access');
          router.navigate(['login']);
        }
        return throwError(error);
      })
    );
  };
