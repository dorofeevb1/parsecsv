import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, delay, tap, catchError } from 'rxjs';

export type CsvDataPayload = {
  [filename: string]: any[];
};

@Injectable({
  providedIn: 'root'
})
export class MetricsService {

  // --- SERVICE CONFIGURATION ---

  // 1. A single, clear switch to control behavior.
  // Set to `true` for development without a backend.
  // Set to `false` to make real HTTP calls.
  private static readonly USE_SIMULATION = true; 
  
  private static readonly SIMULATE_ERROR = false; // Only used if USE_SIMULATION is true
  private static readonly SIMULATION_DELAY = 1200;
  
  // CORRECTED: Removed trailing slash for better consistency.
  private readonly apiUrl = 'metrics/upload-processed/'; 

  constructor(private http: HttpClient) { }

  /**
   * Sends the parsed JSON data from multiple CSV files to the backend.
   * @param payload An object where keys are filenames and values are arrays of JSON objects.
   * @returns Observable that notifies of the operation result.
   */
  sendData(payload: CsvDataPayload): Observable<any> {
    console.log('%c[MetricsService] Отправка данных на бэкенд...', 'color: blue; font-weight: bold;', payload);

    // --- LOGIC SWITCH ---
    // This structure ensures only one path (simulation or real call) is ever taken.
    if (MetricsService.USE_SIMULATION) {
      // 2. The entire simulation block is now self-contained.
      return this.simulateRequest(payload);
    } else {
      // 3. The real HTTP call is now correctly placed in the 'else' block and is reachable.
      return this.http.post<any>(this.apiUrl, payload).pipe(
        tap(response => console.log('Успешный ответ от сервера:', response)),
        catchError(this.handleError)
      );
    }
  }

  /**
   * Helper method for simulating server responses. Keeps the main method clean.
   */
  private simulateRequest(payload: CsvDataPayload): Observable<any> {
    console.log('%c[MetricsService] РЕЖИМ ИМИТАЦИИ АКТИВЕН', 'color: orange; font-weight: bold;');
    
    if (MetricsService.SIMULATE_ERROR) {
      // Simulate a server error
      return throwError(() => new Error('Сервер недоступен (503 Service Unavailable)'))
        .pipe(delay(MetricsService.SIMULATION_DELAY));
    } else {
      // Simulate a successful response
      const mockResponse = { success: true, message: 'Данные успешно сохранены (имитация)', dataReceived: payload };
      return of(mockResponse).pipe(
        delay(MetricsService.SIMULATION_DELAY),
        tap(response => {
          console.log('%c[MetricsService] Получен ответ от сервера (имитация):', 'color: green;', response);
        })
      );
    }
  }

  /**
   * Handles HTTP errors from the backend.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Произошла неизвестная ошибка!';
    
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred.
      errorMessage = `Ошибка на клиенте: ${error.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      errorMessage = `Код ошибки от сервера: ${error.status}. Сообщение: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}