import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/login';
import { Observable} from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BnNgIdleService } from 'bn-ng-idle';
import { ToastrService } from 'ngx-toastr';
import { Token } from '@angular/compiler';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // private baseUrl = 'http://localhost:3000';
  private baseUrl = environment.apiUrl;
  private isAuthenticated: boolean = false;

  constructor(private http: HttpClient,private router: Router,private bnIdle: BnNgIdleService,private toster: ToastrService) {}

  login(username: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/login`, { username, password }).pipe(
      tap(response => {
        const token = response?.token;
        if (token) {
          this.isAuthenticated = true;
          localStorage.setItem('token', token);
          this.toster.success("User login successful")
        } else {
          console.error('Token not found in response');
          this.toster.error('Token not found in response')
        }
      })
    );
  }

  logout(): void {
    this.isAuthenticated = false;
    localStorage.removeItem('token');
    this.router.navigate(["login"]);
  }

  sessionOut(){
    this.bnIdle.startWatching(20 * 60).subscribe((isTimedOut: boolean) => {
    // this.bnIdle.startWatching(10).subscribe((isTimedOut: boolean) => {
      if (isTimedOut) {
        console.log('session expired');
        this.toster.error("session expired")
        this.logout()
        this.bnIdle.stopTimer()
      }
    });

  }
  stopTimer(){
    this.bnIdle.stopTimer()
  }

  isAuthenticatedFn(): boolean {
    return this.isAuthenticated;
  }

}
