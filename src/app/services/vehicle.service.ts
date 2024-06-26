import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';
import { VehicleType } from '../models/vihicle-type';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  private baseUrl = `${environment.apiUrl}/vehicles`;
  vehicleAdded = new Subject<void>();

  constructor(private http: HttpClient) { }

  getAllVehicles(): Observable<VehicleType[]> {
    return this.http.get<VehicleType[]>(this.baseUrl + '/list');
  }

  addVehicle(name: string, icon: File): Observable<VehicleType> {
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('icon', icon);
    return this.http.post<VehicleType>(this.baseUrl + '/add', formData)
  }

  editVehicle(id: string, name: string, icon: File | null): Observable<VehicleType> {
    const formData = new FormData();
    formData.append('name', name);
    if (icon) {
      formData.append('icon', icon);
    }
    return this.http.put<VehicleType>(`http://localhost:3000/vehicles/edit/${id}`, formData);
  }
}
