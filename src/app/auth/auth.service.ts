import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest } from './login/login-request';
import { LoginResult } from './login/login-result';
import { RegisterRequest } from './register/register-request';
import { RegisterResult } from './register/register-result';
import { ForgotPasswordRequest } from './forgot-password/forgot-password-request';
import { ForgotPasswordResult } from './forgot-password/forgot-password-result';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private tokenKey: string = 'token';
  private email: string = 'email';
  private _authStatus = new BehaviorSubject<boolean>(false);
  public authStatus = this._authStatus.asObservable();

  constructor(protected http: HttpClient) {}

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  init(): void {
    if (this.isAuthenticated()) this.setAuthStatus(true);
  }

  login(item: LoginRequest): Observable<LoginResult> {
    const url = `${environment.apiUrl}/Account/login`;
    return this.http.post<LoginResult>(url, item).pipe(
      tap((loginResult) => {
        if (loginResult.success && loginResult.token) {
          localStorage.setItem(this.tokenKey, loginResult.token);
          localStorage.setItem(this.email, item.email);
          this.setAuthStatus(true);
        }
      })
    );
  }
  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.email);
    this.setAuthStatus(false);
  }
  private setAuthStatus(isAuthenticated: boolean): void {
    this._authStatus.next(isAuthenticated);
  }
  register(item: RegisterRequest): Observable<RegisterResult> {
    const url = `${environment.apiUrl}/Account/register`;
    return this.http.post<RegisterResult>(url, item);
  }
  getemail(): string {
    return localStorage.getItem(this.email) || '';
  }

  forgotPassword(
    item: ForgotPasswordRequest
  ): Observable<ForgotPasswordResult> {
    const url = `${environment.apiUrl}/Account/forgotpassword`;
    return this.http.post<ForgotPasswordResult>(url, item);
  }
  resetPassword(item: any): any {
    const url = `${environment.apiUrl}/Account/resetpassword`;
    return this.http.post(url, item);
  }
}
