import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User} from '../models/user';
import { getVehiclePrice } from '../models/createRide';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CreateRideService {
  private baseUrl = `${environment.apiUrl}/createride`;

  constructor(private http: HttpClient) {}

  searchUsers(countryId: string, phone: string): Observable<User[]> {
    const body = { countryId, phone };
    return this.http.post<User[]>(`${this.baseUrl}/searchUser`,  body );
  }

  getVehiclePrice(zoneCityId: string): Observable<getVehiclePrice[]> {
    const body = { zoneCityId};

    return this.http.post<getVehiclePrice[]>(`${this.baseUrl}/getVehiclePrice`,  body );
  }
  saveRide(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/saveRide`, data);
  }
  checkPoint(countryId:any,checkPoint: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/checkPoint`, {countryId,checkPoint});
  }
}
