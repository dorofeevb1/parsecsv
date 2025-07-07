import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, delay, tap, catchError } from 'rxjs';

// Define the type for the payload received by the service.
export type CsvDataPayload = {
  [filename: string]: any[];
};

/*
// --- OLD DATA MODELS ---
// These interfaces did not match the data being sent by the component.
// They expected pre-calculated metrics, but the component sends raw JSON data.
// They are commented out to avoid confusion.

export interface FileMetric {
  totalViews: number;
}
export interface AllMetrics {
  [filename: string]: FileMetric;
}
*/

@Injectable({
  providedIn: 'root'
})
export class MetricsService {

  private static readonly SIMULATE_ERROR = false;
  private static readonly SIMULATION_DELAY = 1200;
  private readonly apiUrl = '/api/data'; // Changed URL to be more generic

  constructor(private http: HttpClient) { }

  /**
   * CORRECTED: Renamed method from 'sendMetrics' to 'sendData' and updated payload type.
   * Sends the parsed JSON data from multiple CSV files to the backend.
   * @param payload An object where keys are filenames and values are arrays of JSON objects.
   * @returns Observable that notifies of the operation result.
   */
  sendData(payload: CsvDataPayload): Observable<any> {
    console.log('%c[MetricsService] Отправка данных на бэкенд...', 'color: blue; font-weight: bold;', payload);

    // ----- SIMULATION BLOCK -----
    if (MetricsService.SIMULATE_ERROR) {
      return throwError(() => new Error('Сервер недоступен (503 Service Unavailable)'))
        .pipe(
          delay(MetricsService.SIMULATION_DELAY)
        );
    } else {
      const mockResponse = { success: true, message: 'Данные успешно сохранены на сервере', dataReceived: payload };
      
      return of(mockResponse).pipe(
        delay(MetricsService.SIMULATION_DELAY),
        tap(response => {
          console.log('%c[MetricsService] Получен ответ от сервера (имитация):', 'color: green;', response);
        })
      );
    }

    /*
      // ----- REAL HTTP CALL (for production) -----
      return this.http.post<any>(this.apiUrl, payload).pipe(
        tap(response => console.log('Успешный ответ от сервера:', response)),
        catchError(this.handleError)
      );
    */
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Произошла неизвестная ошибка!';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Ошибка на клиенте: ${error.error.message}`;
    } else {
      errorMessage = `Код ошибки от сервера: ${error.status}\nСообщение: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}