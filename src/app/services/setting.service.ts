import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Setting } from '../models/setting';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private baseUrl = `${environment.apiUrl}/setting`;

  constructor(private http: HttpClient) {}
  saveSetting(selectedSeconds: number, selectedStopCount: number,settings: any): Observable<Setting> {
    console.log("ser............",settings)
    const body = {selectedSeconds, selectedStopCount, settings };
    return this.http.post<Setting>(`${this.baseUrl}/save`, body);
  }
  getSetting(): Observable<Setting[]> { 
    return this.http.get<Setting[]>(`${this.baseUrl}/get`);
  }
}
