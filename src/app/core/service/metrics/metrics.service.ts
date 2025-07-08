import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, delay, tap, catchError, BehaviorSubject } from 'rxjs';
import { ApiService } from '../api/api.service';

// Определяем тип для данных, которые будут отправлены в сервис.
// Это объект, где ключ - имя файла, а значение - массив распарсенных JSON-объектов.
export type CsvDataPayload = {
    [filename: string]: any[];
};

@Injectable({
    providedIn: 'root'
})
export class MetricsService {

    // --- НАСТРОЙКИ СЕРВИСА ---
    private processedDataSource = new BehaviorSubject<CsvDataPayload | null>(null);

    // Публичный Observable, на который подпишется StatisticComponent.
    // Знак $ в конце - общепринятое соглашение для Observable.
    public processedData$ = this.processedDataSource.asObservable();
    // 1. Единственный и понятный переключатель для управления поведением сервиса.
    // Установите `true` для разработки без бэкенда (режим имитации).
    // Установите `false` для отправки реальных HTTP-запросов.
    private static readonly USE_SIMULATION = false;

    // Используется, только если USE_SIMULATION равно `true`
    private static readonly SIMULATE_ERROR = false;
    private static readonly SIMULATION_DELAY = 1200; // Задержка в миллисекундах

    // ИСПРАВЛЕНО: Удален последний слэш для лучшей совместимости.
    // Этот URL будет относительным, что может вызвать проблемы.
    // Рекомендуется использовать прокси или интерцептор для добавления базового URL API.
    private readonly apiUrl = 'data/';

    constructor(private api: ApiService) { }

    /**
     * Отправляет распарсенные JSON-данные из нескольких CSV-файлов на бэкенд.
     * @param payload Объект, где ключи - это имена файлов, а значения - массивы JSON-объектов.
     * @returns Observable, который уведомит о результате операции.
     */
    sendData(payload: CsvDataPayload, platform: string): Observable<any> {
        // Создаем новый объект для отправки, который включает и платформу, и файлы.
        const requestBody = {
            platform: platform,
            files: payload
        };
        
        console.log('%c[MetricsService] Отправка данных на бэкенд...', 'color: blue; font-weight: bold;', requestBody);
        
        // В BehaviorSubject по-прежнему отправляем только данные файлов,
        // так как компонент статистики не зависит от платформы.
        this.processedDataSource.next(payload);
        
        if (MetricsService.USE_SIMULATION) {
            return this.simulateRequest(requestBody);
        } else {
             // Отправляем новый requestBody
             return this.api.post<any>(this.apiUrl, requestBody).pipe(
                tap(response => console.log('Успешный ответ от сервера:', response)),
                catchError(this.handleError)
            );
        }
    }



    /**
     * Вспомогательный метод для имитации ответов от сервера.
     * Помогает сохранить основной метод чистым и читаемым.
     */
    private simulateRequest(requestBody: any): Observable<any> {
        console.log('%c[MetricsService] РЕЖИМ ИМИТАЦИИ АКТИВЕН', 'color: orange; font-weight: bold;');

        if (MetricsService.SIMULATE_ERROR) {
            return throwError(() => new Error('Сервер недоступен (503 Service Unavailable)'))
                .pipe(delay(1200));
        } else {
            const mockResponse = { success: true, message: 'Данные успешно сохранены (имитация)', dataReceived: requestBody };
            return of(mockResponse).pipe(
                delay(1200),
                tap(response => console.log('%c[MetricsService] Получен ответ от сервера (имитация):', 'color: green;', response))
            );
        }
    }
    /**
     * Обрабатывает ошибки HTTP-запросов от бэкенда.
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Произошла неизвестная ошибка!';

        if (error.error instanceof ErrorEvent) {
            // Произошла ошибка на стороне клиента или в сети.
            errorMessage = `Ошибка на клиенте: ${error.error.message}`;
        } else {
            // Бэкенд вернул код ошибки.
            errorMessage = `Код ошибки от сервера: ${error.status}. Сообщение: ${error.message}`;
        }

        console.error(errorMessage);
        // Возвращаем Observable с понятным для пользователя сообщением об ошибке.
        return throwError(() => new Error(errorMessage));
    }
}