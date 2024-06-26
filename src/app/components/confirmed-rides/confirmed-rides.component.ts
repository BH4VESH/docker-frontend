import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { ConfirmedRidesService } from '../../services/confirmed-rides.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormsModule } from '@angular/forms';
import { VehicleService } from '../../services/vehicle.service';
import { SocketService } from '../../services/socket.service';
import { DurationConvertPipe } from "../../pipes/duration-convert.pipe";
import { environment } from '../../../environments/environment.development';



@Component({
    selector: 'app-confirmed-rides',
    standalone: true,
    templateUrl: './confirmed-rides.component.html',
    styleUrl: './confirmed-rides.component.css',
    imports: [CommonModule, MatPaginatorModule, FormsModule, DurationConvertPipe]
})
export class ConfirmedRidesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  search: string = '';
  statusSearch: number = -1;
  vehicleSearch: string = '';
  searchText: any
  searchDate: any 

  currentPage: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 3;

  allRideList:any[]=[]
  vehicleList:any[]=[]
  // messageInput: any;

  constructor(
    private ConfirmedRidesService:ConfirmedRidesService,
    private ToastrService:ToastrService,
    private VehicleService:VehicleService,
    private SocketService:SocketService,
    
  ){
    
  }
  
  ngOnInit(): void {
    this.fetchRideList()
    // this.performSearch()
    this.getVehicle()
    // this.getDriverData()
    // this.assigndriverdata()
    this.deletLisn()
    this.gettingstatusafterassigninCFR()
    this.listennearestassignbuttonclick()
    this.listingCronUpdate()
    this.listingCronUpdate2A()
    this.listingCronUpdate2B()
    this.listingCronUpdate2C()
    this.rejectDriverRequestlisn()
    this.listenassignrejected()
    this.ridestatusupates()

  }



  fetchRideList(): void {
    this.ConfirmedRidesService.getRideList(this.currentPage, this.itemsPerPage).subscribe(
      (response: any) => {
        if (response.success) {
          this.allRideList = response.rideList;
          this.totalItems = response.totalItems;
          console.log("it is all rides : ",response)
          console.log("all ride list :",this.allRideList)
          console.log(this.vehicleList)
        } else {
          this.ToastrService.error('Error fetching ride data:', response.message);
        }
      },
      error => {
        this.ToastrService.warning('Not data awailable');
        console.log('Error fetching ride data',error)
      }
    );
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    
    if (this.search || this.statusSearch !==-1 || this.vehicleSearch!=='' || this.searchDate) {
      console.log("79 line search work")
      this.performSearch()
    } else {
      console.log("else part")
      // this.paginator.pageIndex = this.currentPage - 1;
      this.fetchRideList()
    }
    
  }

  getVehicle(){
    this.VehicleService.getAllVehicles().subscribe((responce:any)=>{
      if (responce) {
        this.vehicleList=responce
        console.log(responce,"it is vehicle")
      }
    })
  }


  performSearch() {
    // Call your API service method to perform the search
    this.ConfirmedRidesService.searchRides(this.statusSearch,this.vehicleSearch,this.searchText,
      this.searchDate,this.currentPage,this.itemsPerPage).subscribe((result) => {
      // Handle the search result here
      // this.allRideList=[]
      this.allRideList=result.result
      this.totalItems=result.totalItems
      console.log('Search Result:', result);
    });
  }
  
  clearFields() {
    this.statusSearch = -1;
    this.vehicleSearch = '';
    this.searchText = '';
    this.searchDate = '';
    this.fetchRideList()
  }

  // info
  infoData: any[] = [];

  rideInfo(rideId: any) {
    console.log(rideId);
   
    this.infoData = [];
  
    for (let x = 0; x < this.allRideList.length; x++) {
      if (rideId == this.allRideList[x]._id) {
        this.infoData.push(this.allRideList[x]);
        break;
      }
    }
    
    console.log(this.infoData);
  }
  getUserPic(iconName: string): string {
    return `${environment.apiUrl}/uploads/userProfilePic/${iconName}`;
  }
  getServiceIcon(iconName: string): string {
    return `${environment.apiUrl}/uploads/icons/${iconName}`;
  }
  getDriverPic(iconName: string): string {
    return `${environment.apiUrl}/uploads/driver_list_profile/${iconName}`;
  }


  // ///////////////////////////////assign btn  model///////////

  dataArray: any[] = [];
  driverArray: any[] = [];
 
  cityId: any;
  serviceId: any;
  rideId:any
  driverId:any
  // rejectdriver:any;
  // driver: any

    // ---------------------------click sign btn----------------------------
    openAssignDriverDialog(ride: any): void {
      this.dataArray=[ride]
      console.log("selected rided :",ride);
      this.getDriverData(ride)
    }
  
    // ---------------------------get driver data------------------------
    
    getDriverData(ride:any) {
      this.rideId=ride._id
      this.cityId = ride.cityId;
      this.serviceId = ride.vehicleId;
      console.log("it is selected city id:",this.cityId);
      console.log("it is selected service id :",this.serviceId);
      
      
      this.SocketService.getAssignedDriverData(this.cityId, this.serviceId)
  
      this.SocketService.onAssignedDriverData().subscribe((driverData) => {
        // console.log(driverData);
  
        if (driverData) {
  
          this.driverArray = driverData;
          // console.log(this.driverArray);
          // this.driver = driverData
  
        } else {
          console.log('Error retrieving assigned driver data:', driverData);
        }
      });

      // ------------------real time driver aprove/decline chenge =>(assign)
      this.SocketService.onUpdateStatusData().subscribe({
        next: (response) => {
          console.log("223 ",response);
          
          this.SocketService.getAssignedDriverData(this.cityId, this.serviceId)
  
          this.SocketService.onAssignedDriverData().subscribe((driverData) => {
            console.log("soket driver data :",driverData);
            if (driverData) {
  
              this.driverArray = driverData;
              console.log("it is driver array : ",this.driverArray);
  
            } else {
              console.log('Error retrieving assigned driver data:', driverData);
            }
          });
        }
      })
  
      // ---------------------update service on real time in the => drivet table

      this.SocketService.onUpdateServiceData().subscribe({
        next: (servicedata) => {
        console.log("service data in conf ride : ",servicedata);
        this.SocketService.getAssignedDriverData(this.cityId, this.serviceId)
  
        if (servicedata) {
  
          this.driverArray = servicedata;
          // console.log(this.driverArray);
  
        } else {
          console.log('Error retrieving assigned driver data:', servicedata);
        }
        }
  
  
      });

  
    }

   // ------------------------updaton final confirm btn click(in modal)-----------------
  // assigndriverdata(){
  //   this.SocketService.onFinalassignedDriverData('data').subscribe({
  //     next: (response) => {
  //       // console.log("New Assigned Driver Details:    ",response);

  //       this.SocketService.getAssignedDriverData(this.cityId, this.serviceId)
  //       // console.log(this.cityId, this.serviceId);
        

  //       this.SocketService.onAssignedDriverData().subscribe((driverData) => {
  //         // console.log("Remaining Driver to Assign: ",driverData);
  //         this.driverArray = driverData;
  //       });
  //     }
  //   })
  // }

    assignDriver(driver:any){
      this.driverId = driver._id
      console.log(this.driverId)
      // this.rideId = this.driverdataArray.ridedata._id
      // this.cityId = this.driverdataArray.ridedata.cityId
      // this.serviceId = this.driverdataArray.ridedata.serviceId
      console.log("assignDriver :",driver)
     
        this.SocketService.emitassignedDriver(this.driverId  , this.rideId)
        // this.SocketService.onFinalassignedDriverData('new')

    }

    
  gettingstatusafterassigninCFR() {
    this.SocketService.onFinalassignedDriverData('data').subscribe((res: any) => {

      if(this.allRideList.length==0){
        this.allRideList = res.alldata[0]
      }else{
        let matchIndex = -1;//find and replace
        for (let i = 0; i < this.allRideList.length; i++) {
          const data = this.allRideList[i];

          if (data._id === res.alldata[0]._id) {
            matchIndex = i;
            break;
          }
          else{
            console.log("aaaaaaaaaaaaaaaaaaaa",data._id)
          }
        }
        this.allRideList[matchIndex] = res.alldata[0]

      }
    console.log("test data :",res.alldata[0]._id)
      // this.fetchRideList();
    })
  }

   //-----------------------cancel ride-----------------------
  cancelRide(rideId: any) {
    console.log(rideId);
    this.ConfirmedRidesService.delete(rideId).subscribe((res) => {
      console.log(res)
      // this.allRideList
      const index = this.allRideList.findIndex(ride => ride._id === res.ridedata
        ._id);

        if (index !== -1) {
          this.allRideList.splice(index, 1);
        }
    })

  }
  deletLisn() {
    this.SocketService.listencancelride().subscribe((ridedata: any) => {
      this.ToastrService.warning(ridedata.message)
      // this.fetchRideList()
    })
  }

  NearestDriver() {
    this.dataArray[0].nearest = true
    this.SocketService.emitnearestdriver(this.rideId, this.cityId, this.serviceId)
    console.log("NearestDriver")
  }
  //---------------------nearest click--------------------//
  listennearestassignbuttonclick() {
    this.SocketService.listeningnearestdriver().subscribe((res: any) => {
      // this.fetchRideList()

        if(this.allRideList.length==0){
          this.allRideList = res.alldata[0]
        }else{
          let matchIndex = -1;//find and replace
          for (let i = 0; i < this.allRideList.length; i++) {
            const data = this.allRideList[i];

            if (data._id === res.alldata[0]._id) {
              matchIndex = i;
              break;
            }
            else{
              console.log("aaaaaaaaaaaaaaaaaaaa",data._id)
            }
          }
          this.allRideList[matchIndex] = res.alldata[0]

        }
      console.log("test data :",res.alldata[0]._id)
    })
  }

  // ----------------------crone listning-------------------
  listingCronUpdate(){
    this.SocketService.listenForUpdateData().subscribe((res:any) => {
      // console.log('Received data from cron server:', res);
       console.log('Received data(rideId):', res.cronRide.ridedata._id);
       console.log('Received data():', res.cronRide.driverdata._id);
      // console.log("deleted data id :",res.cronRide.ridedata._id); 
      const index = this.allRideList.findIndex(ride => ride._id === res.cronRide.ridedata._id);

      if (index !== -1) {
        // replace driver&ride data
        // console.log(this.allRideList[index].driver.assign)
        // this.allRideList[index].driver = res.cronRide.driverdata;
        this.allRideList[index].ridestatus=res.cronRide.ridedata.ridestatus
        this.allRideList[index].assigned=res.cronRide.ridedata.assigned
        this.allRideList[index].driverId=null
      }
      // this.fetchRideList()
      // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAA",this.allRideList)
    });
  }
  listingCronUpdate2A(){
    this.SocketService.listenForUpdateData2A().subscribe((res:any) => {
      const index = this.allRideList.findIndex(ride => ride._id === res.cronRide.ridedata._id);

      if (index !== -1) {
        // replace driver&ride data
        // this.allRideList[index].driver = res.cronRide.driverdata;
        this.allRideList[index].ridestatus=res.cronRide.ridedata.ridestatus
        this.allRideList[index].assigned=res.cronRide.ridedata.assigned
        this.allRideList[index].driverId=res.cronRide.driverdata;
      }
      this.fetchRideList()
      // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAA",this.allRideList)
    });
  }
  listingCronUpdate2B(){
    this.SocketService.listenForUpdateData2B().subscribe((res:any) => {
      const index = this.allRideList.findIndex(ride => ride._id === res.cronRide.ridedata._id);

      if (index !== -1) {

        this.allRideList[index].ridestatus=res.cronRide.ridedata.ridestatus
        this.allRideList[index].assigned=res.cronRide.ridedata.assigned
        this.allRideList[index].driverId=null
      }
      // this.fetchRideList()
      // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAA",this.allRideList)
    });
  }
  listingCronUpdate2C(){
    this.SocketService.listenForUpdateData2C().subscribe((res:any) => {

      const index = this.allRideList.findIndex(ride => ride._id === res.cronRide.ridedata._id);

      if (index !== -1) {
        this.allRideList[index].ridestatus=res.cronRide.ridedata.ridestatus
        this.allRideList[index].assigned=res.cronRide.ridedata.assigned
        this.allRideList[index].driverId=null
      }
      // this.fetchRideList()
      // console.log("AAAAAAAAAAAAAAAAAAAAAAAAAA",this.allRideList)
    });
  }



  // ---------------------reject driver-------------------
  rejectDriverRequestlisn(){
    this.SocketService.listenrejectRunningRequest().subscribe(data=>{
      console.log("rejected data :",data)
      this.fetchRideList()
    })
  }
  listenassignrejected(){
    this.SocketService.listenassignrejected().subscribe(data=>{
      this.fetchRideList()
    })
  }

   // -----------------accept btn listning
   ridestatusupates() {
    this.SocketService.listeningrideupdates().subscribe((res: any) => {
      // console.log("RRRRRRRRRRRRRRRRRRR",res)
      // console.log("sssssssssssssssssssssssssss",res.ride.ridestatus)
      const index = this.allRideList.findIndex(ride => ride._id === res.ride._id);

      if (index !== -1) {
        if(res.ride.driverId==null){
          this.allRideList[index].ridestatus=res.ride.ridestatus
          this.allRideList[index].driverId=null
        }else{
          if (res.ride.ridestatus==7) {
            this.allRideList.splice(index,1)
            this.totalItems--
          } else {
            this.allRideList[index].ridestatus=res.ride.ridestatus
          }
        }
      }
      // this.fetchRideList()

    } );
  }


}
