import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ConfirmedRidesService {
  // private baseUrl = 'http://localhost:3000/confirmedride';
  private baseUrl = `${environment.apiUrl}/confirmedride`;

  constructor(private http: HttpClient) { }

  getRideList(page: number, limit: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/getRideList?page=${page}&limit=${limit}`);
  }

  searchRides(statusSearch: number, vehicleSearch: string, searchText: string,searchDate:string, page: number, limit: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/search`, {statusSearch, vehicleSearch, searchText,searchDate, page, limit});
  }
  delete(rideId: string,): Observable<any> {
    console.log("service",rideId)
    return this.http.post(`${this.baseUrl}/delete`,{rideId});
  }
  
}
