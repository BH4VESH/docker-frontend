import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Country } from '../models/country';
import { environment } from '../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class CountryService {
  

  private apiUrl = 'https://restcountries.com/v3.1/name/';
  

  constructor(private http: HttpClient) { }

  searchCountries(query: string): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.apiUrl}${query}`);
  }

  // database
  addCountry(country: Country): Observable<Country> {
    return this.http.post<Country>(`${environment.apiUrl}/countrys/add`, country);
  }
  fatchCountry(): Observable<Country[]> { 
    return this.http.get<Country[]>(`${environment.apiUrl}/countrys/get`);
  }
  

}
