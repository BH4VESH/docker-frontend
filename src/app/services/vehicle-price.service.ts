import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VehiclePrice, getVehiclePrice } from '../models/vihiclePrice';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class VehiclePriceService {

  private apiUrl = `${environment.apiUrl}/vehicle/price`;

  constructor(private http: HttpClient) { }

  sendData(data: VehiclePrice): Observable<VehiclePrice> {
    return this.http.post<VehiclePrice>(`${this.apiUrl}/add`, data);
  }

  getPrice(page: number, limit: number): Observable<getVehiclePrice> {
    return this.http.get<getVehiclePrice>(`${this.apiUrl}/get?page=${page}&limit=${limit}`);
  }
  updatePrice(data: any, id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/edit/${id}`, data);
  }

}
