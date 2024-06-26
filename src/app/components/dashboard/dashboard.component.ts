import { Component, OnDestroy, OnInit } from '@angular/core';
import { authguardGuard } from '../../guards/authguard.guard';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit,OnDestroy {

  constructor(private _AuthService:AuthService) {}
  
  ngOnInit(): void {
    this._AuthService.sessionOut()
  }
  ngOnDestroy(): void {
    this._AuthService.stopTimer
  }

  // logout(): void {
  //   // this.authService.logout();
  //   sessionStorage.setItem("isLoggedIn",'false')
  //   // Redirect to login page
  // }


  // logout(): void {
  //  this._AuthService.logout()
  // }

}
