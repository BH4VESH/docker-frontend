import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SocketService } from '../../services/socket.service';
import { DurationConvertPipe } from "../../pipes/duration-convert.pipe";
import { SettingService } from '../../services/setting.service';
import { RunningRequestService } from '../../services/running-request.service';
import { NotificationService } from '../../services/notification.service';
import { environment } from '../../../environments/environment.development';
declare var Stripe: any;


@Component({
    selector: 'app-running-request',
    standalone: true,
    templateUrl: './running-request.component.html',
    styleUrl: './running-request.component.css',
    imports: [CommonModule, DurationConvertPipe]
})
export class RunningRequestComponent implements OnInit {

  // assignedArray: any;
  driverId: any;
  rideId: any;
  driverdata: any;
  assignedArray: any[] = [];
  countdownTimers: { [key: string]: any } = {};
  settingTime!:number
  // private subscriptions: Subscription[] = [];
  

  constructor(
    private ToastrService:ToastrService,
    private SocketService:SocketService,
    private Setting:SettingService,
    private RunningRequestService:RunningRequestService,
    private NotificationService:NotificationService

  ){
    this.NotificationService.requestPermission();
  }

  acceptNotification() { 
  const data:any={
      'title': 'Accept',
      'alertContent': 'Driver Accepted Request...'
    };
    this.NotificationService.generateNotification(data);
  }
  rejectNotification() { 
  const data:any={
      'title': 'Reject',
      'alertContent': 'Driver Reject Request...'
    };
    this.NotificationService.generateNotification(data);
  }
  driverNotFoundNotifi() { 
  const data:any={
      'title': 'Driver Status',
      'alertContent': 'Driver is not found...'
    };
    this.NotificationService.generateNotification(data);
  }


  getUserPic(iconName: string): string {
    return `http://localhost:3000/uploads/userProfilePic/${iconName}`;
  }
  getServiceIcon(iconName: string): string {
    return `http://localhost:3000/uploads/icons/${iconName}`;
  }
  getSettingTime(){
    this.Setting.getSetting().subscribe((settingTime)=>{
      this.settingTime=settingTime[0].selectedSeconds
      // console.log("settingTime :",settingTime[0].selectedSeconds)
    })
  }

  ngOnInit() {
    this.getRunningData();
    this.listingCronUpdate()
    this.listingCronUpdate2A()
    this.listingCronUpdate2B()
    this.listingCronUpdate2C()
    this.gettingFinalAssignClick()
    this.listennearestassignbuttonclick()
    this.rejectDriverRequestlisn()
    this.listenassignrejected()
    this.ridestatusupates()
    // this.listeningmytaskfunc()
  }

  getRunningData() {
    this.getSettingTime()

    this.RunningRequestService.getRunningData().subscribe((data)=>{
      console.log("fetch all data :",data);
      this.assignedArray = data.alldata;
      console.log("assign arr :",this.assignedArray);
    })
  }

    // info
    infoData: any[] = [];

    rideInfo(rideId: any) {
      console.log(rideId);
     
      this.infoData = [];
    
      for (let x = 0; x < this.assignedArray.length; x++) {
        if (rideId == this.assignedArray[x]._id) {
          this.infoData.push(this.assignedArray[x]);
          break;
        }
      }
      
      console.log(this.infoData);
    }

    // --------------when near click
    listennearestassignbuttonclick() {
      this.SocketService.listeningnearestdriver().subscribe((res: any) => {
        const rideData=res.alldata[0]
        if (rideData) {
          this.assignedArray.push(rideData)
          this.startCountdown(rideData._id ,rideData.assigningTime);
        }
        console.log("when nearest click : ",res.alldata)
      })
    }


    gettingFinalAssignClick() {
      this.SocketService.onFinalassignedDriverData('data').subscribe((res: any) => {
        const rideData=res.alldata[0]
        if (rideData) {
          this.assignedArray.push(rideData)
          this.startCountdown(rideData._id , rideData.assigningTime);
        }
        // when assign=>start clock

        // this.getRunningData();
      })
    }

    // ----------------------crone listning-------------------
  listingCronUpdate(){
    this.SocketService.listenForUpdateData().subscribe((res:any) => {
      // console.log('Received data from cron server:', res.cronRide.ridedata);
      // console.log("deleted data id :",res.cronRide.ridedata._id); 
      const index = this.assignedArray.findIndex(ride => ride._id === res.cronRide.ridedata._id);

      if (index !== -1) {
        this.assignedArray.splice(index, 1);
      }
      // this.getRunningData()
    });
  }

  listingCronUpdate2A(){
    this.SocketService.listenForUpdateData2A().subscribe((res:any) => {
      console.log("2A",res)
      // this.getRunningData()
      //  console.log('Received data(rideId):', res.cronRide.ridedata._id);
      //  console.log('Received data():', res.cronRide.driverdata._id);
      const index = this.assignedArray.findIndex(ride => ride._id === res.cronRide.ridedata._id);
    
        if (index !== -1) {
          // replace driver&ride data
          this.assignedArray.splice(index, 1);
          this.assignedArray.push(res.cronRide.updatedata)
          this.startCountdown( res.cronRide.ridedata._id , res.cronRide.ridedata.assigningTime);
     
        }else{
          this.assignedArray.push(res.cronRide.updatedata)
          this.startCountdown( res.cronRide.ridedata._id , res.cronRide.ridedata.assigningTime);
          console.log("aaaaaaaa")
        }

    });
  }
  listingCronUpdate2B(){
    this.SocketService.listenForUpdateData2B().subscribe((res:any) => {

      const index = this.assignedArray.findIndex(ride => ride._id === res.cronRide.ridedata._id);

        if (index !== -1) {
          // this.getRunningData()
          this.assignedArray.splice(index, 1);
        }else{
          console.log("aaaaaaaa")
        }
   
    });
    
  }
  listingCronUpdate2C(){
    this.SocketService.listenForUpdateData2C().subscribe((res:any) => {

      console.log(res)
      // this.getRunningData()
      // removeObjectById(assignedArray, res.cronRide.ridedata._id);
      const updated=this.assignedArray.filter(element => element._id !==  res.cronRide.ridedata._id);
      this.assignedArray=updated
      const index = this.assignedArray.findIndex(ride => ride._id === res.cronRide.ridedata._id);
      this.driverNotFoundNotifi()
   
    });
  }

  
  // ........................clock timer........................

  startCountdown(id: string, startTime: number) {
    if (this.countdownTimers[id]) {
      clearInterval(this.countdownTimers[id]);
    }

    // const countdownTime = 30000; // 10 seconds
    const countdownTime = this.settingTime*1000; // 10 seconds
    const adjustedStartTime = startTime + 1000;
    const endTime = adjustedStartTime + countdownTime;

    this.countdownTimers[id] = setInterval(() => {
      const currentTime = Date.now();
      const timeLeft = Math.max(0, endTime - currentTime);

      const secondsLeft = Math.floor(timeLeft / 1000);

      const row = this.assignedArray.find((data: { _id: string; }) => data._id === id);
      if (row) {
        row.countdown = `${secondsLeft} sec`;

        if (timeLeft <= 0) {
          clearInterval(this.countdownTimers[id]);
          delete this.countdownTimers[id];
        }
      }

      this.assignedArray = [...this.assignedArray];
    }, 1000);
  }


  //--------------------reject running request----------

  rejectRide(data: any) {
    this.rideId = data._id
    this.driverId = data.driverId

    console.log("xxxxxxxxxxxx",this.rideId,this.driverId)

    this.rejectRunningRequest(this.driverId, this.rideId);
  }

  rejectRunningRequest(driverId: string, rideId: string) {
    console.log(rideId, driverId);
    const data = {
      rideId: rideId,
      driverId: driverId
    }

    this.RunningRequestService.rejectRide(data).subscribe((res)=>{
      console.log("rejected",res)
      this.startCountdown( res.result._id , res.result.assigningTime);
    })
  }

  // ---------------------reject driver-------------------
  rejectDriverRequestlisn(){
    this.SocketService.listenrejectRunningRequest().subscribe(data=>{
      console.log("rejected data :",data)
      this.getRunningData()
      this.rejectNotification()
    })
  }
  listenassignrejected(){
    this.SocketService.listenassignrejected().subscribe(data=>{
      this.getRunningData()
      this.rejectNotification()
    })
  }



  // ------------------accept ride------------
    acceptRide(data: any){
      console.log(data);
    
      const dataA = {
        rideId: data._id,
        driverId: data.driverId
      }

      this.RunningRequestService.acceptRide(dataA).subscribe((res)=>{
        console.log(res,"aaaaaaaaaaaaaaaaaaaaaa")
      })
    }




    arriveRide(data: any){

      const dataB = {
        rideId: data._id,
      }
    
     
      this.RunningRequestService.arriveRide(dataB).subscribe((res)=>{
        console.log(res,"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbb")
      })
    }

    pickRide(data: any){
  
      const dataC = {
        rideId: data._id,
      }
      
      this.RunningRequestService.pickRide(dataC).subscribe((res)=>{
        console.log(res,"ccccccccccccccccccccccccc")
      })
    }
  
    startRide(data: any){
  
      const dataD = {
        rideId: data._id,
      }
      
      this.RunningRequestService.startRide(dataD).subscribe((res)=>{
        console.log(res,"ddddddddddddddddddd")
      })
    }

    // stripe: any;

    test() {
      const stripe = Stripe(environment.stripePublicKey);
      const elements = stripe.elements();

      const cardData = {
        number: '4000000000000077',
        exp_month: 12,
        exp_year: 2024,
        cvc: '123'
      };
      const card = elements.create('card',cardData);
      
      stripe.createToken(card).then((result:any) => {
        const token = result.token;
        console.log(token.id);
      });
    }


   async completeRide(data: any){
   
      const dataE = {
        // token:token.id,
        rideId: data._id,
        driverId: data.driverId
      }
      
      this.RunningRequestService.completeRide(dataE).subscribe((res)=>{
        console.log(res,"eeeeeeeeeeeeeeeeee")
        console.log(res.auth_redirectUrl)
        this.ToastrService.info(res.message)
         console.log("it is url responce :",res)

      if (res.auth_redirectUrl) {
        window.location.href = res.auth_redirectUrl;
      } else {
        this.ToastrService.info(res.message);
      }
      })
      this.acceptNotification()
    }

    freerideanddriver(data: any){

      const dataF = {
        rideId: data._id,
        driverId: data.driverId
      }
      
      this.RunningRequestService.freerideanddriver(dataF).subscribe((res)=>{
        console.log(res,"ffffffffffffffffffff")
      })

    }

    // -----------------accept btn listning
    ridestatusupates() {
      this.SocketService.listeningrideupdates().subscribe((res: any) => {
        // console.log("compaleeeeeeeeeeee",res.ridestatus)
        console.log("counterrrrrrrrrr",res.counter2)
        console.log("compaleeeeeeeeeeeeride",res.ride.ridestatus)
        const index = this.assignedArray.findIndex(ride => ride._id === res.ride._id);
        
        if (index !== -1) {
          if(res.ride.driverId==null){
            this.assignedArray[index].ridestatus=res.ride.ridestatus
            this.assignedArray.splice(index, 1);
          }else{
            this.assignedArray[index].ridestatus=res.ride.ridestatus
          }
        }
        // this.getRunningData()
      } );
    }
 

}
