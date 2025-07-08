import { Component, OnDestroy, inject } from '@angular/core';
import { CsvDataPayload, MetricsService } from 'src/app/core/service/metrics/metrics.service';
import { Observable, Subscription, take } from 'rxjs';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnDestroy {
  // --- ЗАВИСИМОСТИ И СВОЙСТВА ---

  private metricsService = inject(MetricsService);

  // Подписываемся на Observable с обработанными данными из сервиса.
  public processedData$: Observable<CsvDataPayload | null> = this.metricsService.processedData$;
  
  // Флаг состояния для управления UI кнопки CSV.
  public isGeneratingCsv = false;

  private dataSubscription: Subscription;
  private headersCache: { [filename: string]: string[] } = {};

  constructor() {
    // Подписка для кеширования заголовков таблиц для превью.
    this.dataSubscription = this.processedData$.subscribe(data => {
      if (data) {
        this.cacheHeaders(data);
      }
    });
  }

  ngOnDestroy(): void {
    // Отписываемся, чтобы избежать утечек памяти.
    this.dataSubscription.unsubscribe();
  }

  // --- МЕТОД ГЕНЕРАЦИИ ОТЧЕТА ---

  /**
   * Запускает процесс генерации и скачивания CSV-файла.
   */
  public downloadAsCsv(): void {
    this.isGeneratingCsv = true;
    // Используем take(1), чтобы получить текущее значение и автоматически отписаться.
    this.processedData$.pipe(take(1)).subscribe(data => {
      try {
        if (!data || Object.keys(data).length === 0) {
          console.warn('Нет данных для генерации CSV.');
          return;
        }
        const csvContent = this.convertToCsv(data);
        this.triggerDownload(csvContent, 'report.csv', 'text/csv;charset=utf-8;');
      } catch (error) {
        console.error('Ошибка при генерации CSV:', error);
      } finally {
        this.isGeneratingCsv = false;
      }
    });
  }

  // --- ПРИВАТНЫЕ ХЕЛПЕРЫ ---

  /**
   * Конвертирует объект с данными в строку формата CSV.
   * @param data - Данные из MetricsService.
   * @returns Строка в формате CSV.
   */
  private convertToCsv(data: CsvDataPayload): string {
    let csvString = '';
    
    // Проходим по каждому файлу в объекте данных
    for (const filename in data) {
      if (Object.prototype.hasOwnProperty.call(data, filename) && data[filename].length > 0) {
        // Добавляем заголовок с именем файла
        csvString += `"${filename}"\r\n`;
        
        // Формируем заголовки колонок
        const headers = Object.keys(data[filename][0]);
        csvString += headers.map(h => `"${h}"`).join(',') + '\r\n';

        // Формируем строки
        data[filename].forEach(row => {
          const rowString = headers.map(header => {
            const value = row[header];
            // Экранируем кавычки и оборачиваем значение в кавычки для безопасности
            return `"${String(value).replace(/"/g, '""')}"`;
          }).join(',');
          csvString += rowString + '\r\n';
        });

        // Добавляем пустую строку для разделения данных из разных файлов
        csvString += '\r\n';
      }
    }
    return csvString;
  }

  /**
   * Инициирует скачивание файла в браузере.
   * @param content - Содержимое файла.
   * @param fileName - Имя файла.
   * @param mimeType - MIME-тип файла.
   */
  private triggerDownload(content: string, fileName: string, mimeType: string): void {
    // Добавляем BOM для корректного отображения кириллицы в Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + content], { type: mimeType });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  // --- ХЕЛПЕРЫ ДЛЯ ОТОБРАЖЕНИЯ ПРЕВЬЮ ---
  private cacheHeaders(data: CsvDataPayload): void {
    this.headersCache = {};
    for (const filename in data) {
      if (data[filename]?.length > 0) {
        this.headersCache[filename] = Object.keys(data[filename][0]);
      }
    }
  }

  public getHeaders(filename: string): string[] {
    return this.headersCache[filename] || [];
  }

  // Сохраняет оригинальный порядок элементов в *ngFor при использовании keyvalue pipe
  public originalOrder = (a: KeyValue<string, any[]>, b: KeyValue<string, any[]>): number => {
    return 0;
  }
}