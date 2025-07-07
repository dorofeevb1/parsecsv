import { Injectable } from '@angular/core';
import { 
  HttpClient, 
  HttpErrorResponse, 
  HttpHeaders, 
  HttpParams, 
  HttpRequest, 
  HttpEvent 
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ApiRequestOptions {
  headers?: HttpHeaders | Record<string, string>;
  params?: HttpParams | Record<string, any>;
  reportProgress?: boolean;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  withCredentials?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private createHeaders(headers?: HttpHeaders | Record<string, string>): HttpHeaders {
    if (headers instanceof HttpHeaders) {
      return headers;
    }
    
    let httpHeaders = new HttpHeaders();
    if (headers) {
      Object.entries(headers).forEach(([key, value]) => {
        httpHeaders = httpHeaders.set(key, value);
      });
    }
    return httpHeaders;
  }

  private createParams(params?: HttpParams | Record<string, any>): HttpParams {
    if (params instanceof HttpParams) {
      return params;
    }
    
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          httpParams = httpParams.set(key, value);
        }
      });
    }
    return httpParams;
  }

  private createOptions(options?: ApiRequestOptions): {
    headers?: HttpHeaders;
    params?: HttpParams;
    reportProgress?: boolean;
    responseType?: any;
    withCredentials?: boolean;
  } {
    return {
      headers: this.createHeaders(options?.headers),
      params: this.createParams(options?.params),
      reportProgress: options?.reportProgress,
      responseType: options?.responseType,
      withCredentials: options?.withCredentials
    };
  }

  get<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, this.createOptions(options))
      .pipe(catchError(this.handleError));
  }

  post<T>(endpoint: string, body: any, options?: ApiRequestOptions): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, body, this.createOptions(options))
      .pipe(catchError(this.handleError));
  }

  put<T>(endpoint: string, body: any, options?: ApiRequestOptions): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, body, this.createOptions(options))
      .pipe(catchError(this.handleError));
  }

  patch<T>(endpoint: string, body: any, options?: ApiRequestOptions): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}/${endpoint}`, body, this.createOptions(options))
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`, this.createOptions(options))
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      errorMessage = `Server error: ${error.status} - ${error.message}`;
      
      switch (error.status) {
        case 401:
          errorMessage = 'Unauthorized access';
          break;
        case 403:
          errorMessage = 'Access forbidden';
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}