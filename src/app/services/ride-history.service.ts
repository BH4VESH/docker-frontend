import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { rideDetails,feedback} from '../models/rideHistory';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class RideHistoryService {
  
  constructor(private http: HttpClient) { }

  private baseUrl = `${environment.apiUrl}/ridehistory`;

  getRideList(page: number, limit: number): Observable<rideDetails> {
    return this.http.get<any>(`${this.baseUrl}/getRideList?page=${page}&limit=${limit}`);
  }

  searchRides(statusSearch: number, vehicleSearch: string, searchText: string,startDate: string, endDate: string, page: number, limit: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/search`, {statusSearch, vehicleSearch, searchText,startDate,endDate, page, limit});
  }

  submitFeedback(rideId:string,feedback: feedback): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/feedback`, {rideId,feedback});
  }

}
