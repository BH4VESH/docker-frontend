import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, catchError, tap, throwError } from 'rxjs';
import { User,UserSearchResponse,FatchUser, SortResponce } from '../models/user';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class User2Service {

  private baseUrl = `${environment.apiUrl}/users`;
  userAdded = new Subject<void>();

  constructor(private http: HttpClient) { }

  getUser(page: number, limit: number): Observable<FatchUser> {
    return this.http.get<FatchUser>(`${this.baseUrl}/get?page=${page}&limit=${limit}`);
  }

  getSortUsers(page: number, limit: number, sortBy: string, sortOrder: string): Observable<SortResponce> {
    return this.http.get<SortResponce>(`${this.baseUrl}/getshort?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`).pipe(
      catchError(error => {
        console.error('Error fetching users:', error);
        return throwError('Failed to fetch users');
      })
    );
  }
  

  addUser(countryId:string,username: string, email: string, phone: string, profilePic: File): Observable<User> {
    const formData = new FormData();
    formData.append('profilePic', profilePic);
    formData.append('countryId', countryId);
    formData.append('username', username);
    formData.append('email', email);
    // formData.append('countryCode', countryCode);
    formData.append('phone', phone);
    
    return this.http.post<User>(this.baseUrl + '/add', formData).pipe(
      tap(() => this.userAdded.next())
    );
  }

  deleteUser(userId: string): Observable<User> {
    const url = `${this.baseUrl}/delete/${userId}`;
    return this.http.delete<User>(url);
  }

  editUser(userId: string, username: string, email: string, countryId: string, phone: string, profilePic: File | null): Observable<User> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('countryId', countryId);
    formData.append('phone', phone);
    if (profilePic !==null) {
      formData.append('profilePic', profilePic);
    }
    const url = `${this.baseUrl}/edit/${userId}`;
    return this.http.put<User>(`${this.baseUrl}/edit/${userId}`, formData);
  }

  
  searchUsers(query: string, page: number, pageSize: number): Observable<UserSearchResponse> {
    let params = new HttpParams();
    params = params.append('query', query);
    params = params.append('page', page.toString());
    params = params.append('pageSize', pageSize.toString());
    
    return this.http.get<UserSearchResponse>(`${this.baseUrl}/search`, { params });
  }
}