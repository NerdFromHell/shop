import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const AUTH_API =  'http://localhost:3000/user/';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Credentials': 'true'
  })
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'login',
      JSON.stringify({
        email,
        password,
      })
      ,
      httpOptions
    );
  }

  register(user: any): Observable<any> {
    return this.http.post(
      AUTH_API + 'register',
      {
        user
      }
      ,
      httpOptions
    );
  }

  logout(): Observable<any> {
    return this.http.post(
      AUTH_API + 'logout',
      { }
      ,
      httpOptions
    );
  }
}
