import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { fatchRide } from '../models/runningRequest';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class RunningRequestService {
  private baseUrl = `${environment.apiUrl}/runningride`;

  constructor(private http: HttpClient) { }

  // --------------------get ride
  getRunningData(): Observable<fatchRide> {
    return this.http.get<fatchRide>(`${this.baseUrl}/getRunningData`);
  }
  // --------------------reject ride
  rejectRide(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/rejectRide`, data);
  }
  // ----------------accept ride
  acceptRide(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/acceptRide`, data);
  }
  arriveRide(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/arriveRide`, data);
  }
  pickRide(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/pickRide`, data);
  }
  startRide(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/startRide`, data);
  }
  completeRide(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/completeRide`, data);
  }
  freerideanddriver(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/freerideanddriver`, data);
  }

  
}
