
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, catchError, tap, throwError } from 'rxjs';
import {Driver, DriverServiceType, FatchDriver, UserSearchResponse, fetchCity} from '../models/driver';
import { environment } from '../../environments/environment.development';




interface BankAccountData {
  accountHolderName: string;
  routingNumber: string;
  accountNumber: string;
}

interface BankAccountResponse {
  success: boolean;
  message: string;
  bankAccount?: any;
}

@Injectable({
  providedIn: 'root'
})
export class DriverListService {

  private baseUrl = `${environment.apiUrl}/driverlist`;
  userAdded = new Subject<void>();

  constructor(private http: HttpClient) { }

  getDriver(page: number, limit: number): Observable<FatchDriver> {
    return this.http.get<FatchDriver>(`${this.baseUrl}/get?page=${page}&limit=${limit}`);
  }

  getSortDriver(page: number, limit: number, sortBy: string, sortOrder: string): Observable<FatchDriver> {
    return this.http.get<FatchDriver>(`${this.baseUrl}/getshort?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`).pipe(
      catchError(error => {
        console.error('Error fetching users:', error);
        return throwError('Failed to fetch users');
      })
    );
  }
  

  addDriver(countryId:string,cityId:string,username: string, email: string, phone: string, profilePic: File): Observable<Driver> {
    const formData = new FormData();
    formData.append('profilePic', profilePic);
    formData.append('username', username);
    formData.append('email', email);
    formData.append('cityId', cityId);
    formData.append('countryId', countryId);
    formData.append('phone', phone);
    
    return this.http.post<Driver>(this.baseUrl + '/add', formData).pipe(
      tap(() => this.userAdded.next())
    );
  }

  deleteDriver(driverId: string): Observable<Driver> {
    const url = `${this.baseUrl}/delete/${driverId}`;
    return this.http.delete<Driver>(url);
  }

  editDriver(driverId: string, username: string, email: string, countryId: string,cityId:string, phone: string, profilePic: File | null): Observable<Driver> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('countryId', countryId);
    formData.append('cityId', cityId);
    formData.append('phone', phone);
    if (profilePic !==null) {
      formData.append('profilePic', profilePic);
    }
    const url = `${this.baseUrl}/edit/${driverId}`;
    return this.http.put<Driver>(`${this.baseUrl}/edit/${driverId}`, formData);
  }

  
  searchDriver(query: string, page: number, pageSize: number): Observable<UserSearchResponse> {
    let params = new HttpParams();
    params = params.append('query', query);
    params = params.append('page', page.toString());
    params = params.append('pageSize', pageSize.toString());
    
    return this.http.get<UserSearchResponse>(`${this.baseUrl}/search`, { params });
  }

  addService(driverId: string, serviceId: string): Observable<DriverServiceType> {
    const url = `${this.baseUrl}/service/${driverId}`;
    const body = { serviceId }; 
    return this.http.put<DriverServiceType>(url, body); 
  }
  addStatus(driverId: string): Observable<DriverServiceType> {
    const url = `${this.baseUrl}/status/${driverId}`;
    return this.http.get<DriverServiceType>(url).pipe(
      catchError((error) => {
        console.error(error);
        return throwError('Server error');
      })
    );
  }
  fatchCity(countryId: string): Observable<fetchCity> {
    const url = `${this.baseUrl}/fatchCity/`;
    const body = { countryId }; 
    return this.http.post<fetchCity>(url,body);
  }

  addBankAccount(driverId: string, bankAccountData: BankAccountData): Observable<BankAccountResponse> {
    const url = `${this.baseUrl}/addBankAccount/`;
    return this.http.post<BankAccountResponse>(url, {driverId,bankAccountData})}


}