import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Zone } from '../models/zone';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CityService {

  constructor(private http: HttpClient) { }

  // getCountries(): Observable<string[]> {
  //   // Replace this with your actual API endpoint to fetch countries from the database
  //   return this.http.get<string[]>('http://localhost:3000/countrys/get');
  // }

  createZone(zoneData: Zone): Observable<Zone> {
    return this.http.post<Zone>(`${environment.apiUrl}/city/add`, zoneData)
      .pipe(
        catchError(error => {
          console.error('Error creating zone:', error);
          return throwError(error);
        })
      );
  }

  getAllZone(): Observable<Zone[]> { 
    return this.http.get<Zone[]>(`${environment.apiUrl}/city/get`);
  }

  updateZone(id: string, updatedZone: any): Observable<Zone> {
    console.log("updatedZone service")
    const url = `${environment.apiUrl}/city/update/${id}`;
    return this.http.put<Zone>(url, updatedZone); 
  }
    
}
