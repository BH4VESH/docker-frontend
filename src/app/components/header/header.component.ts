import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet,RouterLinkActive } from '@angular/router';
import { BnNgIdleService } from 'bn-ng-idle';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterOutlet,RouterLink,RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit{
  title = 'admin-dashboard';
  disableLogin: boolean=true
  checkloginbtn:boolean=false
  notif_counter:number=0;

  constructor(
    private _AuthService: AuthService,
    private SocketService:SocketService
  ){}

  logout(): void {
      this._AuthService.logout()
   }
   
 
//  session timeout

   ngOnInit(): void {
    // this._AuthService.sessionOut()
    // this.checkloginbtn=this._AuthService.isSession
    this.listingCronUpdate2C()
    this.ridestatusupates()
    this.listingCronUpdate()
    this.pagerefreshEmit()
    this.pagerefrshLisn()
    this.deletLisn()
  
  }

  // ---cron counter lsn++
  listingCronUpdate2C(){
    this.SocketService.listenForUpdateData2C().subscribe((res:any) => {  
      this.notif_counter= res.cronRide.counter
    });
  }

  // ---cron counter lsn--
  ridestatusupates() {
    this.SocketService.listeningrideupdates().subscribe((res: any) => {
      console.log("counter : ", res.counter2)
     this.notif_counter=res.counter2
     
    } );
  }
  
  // single assign counter--
  listingCronUpdate(){
    this.SocketService.listenForUpdateData().subscribe((res:any) => {
      this.notif_counter=res.cronRide.counter
     
    });
  }

  // page refresh counter
  pagerefreshEmit(){
    this.SocketService.emitCounter()
  }
  pagerefrshLisn(){
    this.SocketService.listenCounter().subscribe((res:any) => {
      this.notif_counter=res.counter 
    });
  }

  // cancel ride
  deletLisn() {
    this.SocketService.listencancelride().subscribe((res: any) => {
      this.notif_counter=res.counter
    })
  }

}
