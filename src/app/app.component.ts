import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet,RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';
import { BnNgIdleService } from 'bn-ng-idle';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,RouterLink,RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {


  }


