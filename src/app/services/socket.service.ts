import { Injectable } from '@angular/core';
import { Observable, observeOn } from 'rxjs';
import { Socket, io } from 'socket.io-client';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  public socket: Socket;
  constructor() {
    // soket conection
    this.socket = io(environment.apiUrl);
     // this.socket = io('ws://localhost:3000');
     this.socket.on('connect', () => {
      console.log('7777777777777777777777777777Connected to server77777777777777777.');
    });
   }

// ----------------real time driver status update-------------------
// updatedriverStatus(driverId: string, status: boolean): void {
//   // console.log(driverId, status);
//   this.socket.emit('driverstatus', { driverId, status });
// }
  onUpdateStatusData(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('statusdata', (data) => {
        // console.log(data);

        observer.next(data);
      });
    });
  }

// ----------------real time driver service update-------------------

  // updatedriverService( driverId: string, serviceID: any ) : void {
  //   // console.log(driverId, servicetype);
  //   this.socket.emit('driverService', { driverId, serviceID});
  // }

  onUpdateServiceData(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('servicedata', (data) => {
        console.log(data);

        observer.next(data);
      });
    });
  }
  
//------------------- filter driver data (city ,service,status=>true)
getAssignedDriverData(cityId: string, serviceId: string): void {
  // console.log(cityId, serviceId);
  this.socket.emit('showdriverdata', { cityId, serviceId });
  
}

onAssignedDriverData(): Observable<any> {
  return new Observable((observer) => {
    this.socket.on('availabledriverdata', (data) => {
      // console.log("it is service driver:",data);
      
      observer.next(data);
    });
    
  });
}

// ------------------------final confirm btn click(in modal)-----------------
emitassignedDriver( driverId: string , rideId: string ): void {
  console.log("driverId:",driverId,  "rideId:",rideId);
  
  this.socket.emit("AssignedData", {driverId, rideId});   
}

onFinalassignedDriverData(data: String): Observable<any> {
  return new Observable((observer) => {
    this.socket.on('newdata', (data: any) => {
      // console.log("ichsohiedkvhhedhocvhwsfi",data);
      
      observer.next(data);
    });
  });
} 

//  // --------------------- cancel ride btn lsn(confirm ride)--------------------
  listencancelride(): Observable<any> {

    return new Observable(observer => {
      this.socket.on('cancelridedata', (ridedata: any) => {
        // console.log(ridedata)

        observer.next(ridedata)
      })
    })
  }
    

//------------------------- near driver (model btn)----------------------------
 emitnearestdriver( rideId: string, cityId: string, serviceId: string ): void {
  // console.log(driverId, rideId);

  this.socket.emit("nearData", {rideId, cityId, serviceId});   
}

listeningnearestdriver(): Observable<any> {
  return new Observable((observer) => {
    this.socket.on('nearResponce', (data: any) => {
      // console.log(data);

      observer.next(data);
    });
  });
}


// ..........................crone update part part.....................................
listenForUpdateData() {
  return new Observable((observer) => {
    // Listen for 'dronUpdateData' event
    this.socket.on('cronUpdateData', (cronRide: any, cronDriver: any) => {
      // console.log('Received cron data:', cronRide, cronDriver);
      // Pass the received data to the observer
      observer.next({ cronRide, cronDriver });
    });
  });
}
listenForUpdateData2A() {
  return new Observable((observer) => {
    // Listen for 'dronUpdateData' event
    this.socket.on('cronUpdateData2A', (cronRide: any, cronDriver: any) => {
      // console.log('Received cron data:', cronRide, cronDriver);
      // Pass the received data to the observer
      observer.next({ cronRide, cronDriver });
    });
  });
}
listenForUpdateData2B() {
  return new Observable((observer) => {
    // Listen for 'dronUpdateData' event
    this.socket.on('cronUpdateData2B', (cronRide: any, cronDriver: any) => {
      // console.log('Received cron data:', cronRide, cronDriver);
      // Pass the received data to the observer
      observer.next({ cronRide, cronDriver });
    });
  });
}
listenForUpdateData2C() {
  return new Observable((observer) => {
    // Listen for 'dronUpdateData' event
    this.socket.on('cronUpdateData2C', (cronRide: any, cronDriver: any) => {
      // console.log('Received cron data:', cronRide, cronDriver);
      // Pass the received data to the observer
      observer.next({ cronRide, cronDriver });
    });
  });
}


// ..........................running part.....................................



listenrejectRunningRequest(): Observable<any>  {

  return new Observable(observer => {
    this.socket.on('runningrequestreject', (data: any) => {
      console.log(data)

      observer.next(data)
    })
  })
}


//--------------------------nearest reject
listenassignrejected(): Observable<any>  {

  return new Observable(observer => {
    this.socket.on('assignrejected', (data: any) => {
      console.log(data)

      observer.next(data)
    })
  })
}



listeningrideupdates(): Observable<any>  {
  
  return new Observable(observer => {
    this.socket.on("rideupdates", (data: any) => {
      // console.log(data)
      observer.next(data)
    })
  })
}

emitCounter() {
  this.socket.emit('counterSend')
}
listenCounter(): Observable<any>  {
  return new Observable(observer => {
    this.socket.on("counterGet", (data: any) => {
      observer.next(data)
    })
  })
}

}