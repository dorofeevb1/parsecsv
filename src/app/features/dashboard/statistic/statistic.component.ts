import { KeyValue } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { MetricsService } from 'src/app/core/service/metrics/metrics.service';

// Тип для наших данных для большей ясности
export type StatisticsPayload = {
  [filename: string]: any[];
};

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss']
})
export class StatisticComponent {
  private metricsService = inject(MetricsService);
  // Принимаем данные из родительского компонента
  public statisticsData$: Observable<StatisticsPayload | null> = this.metricsService.processedData$;

  // Храним заголовки для каждой таблицы, чтобы не вычислять их каждый раз
  // Ключ - имя файла, значение - массив заголовков
  private headersCache: { [filename: string]: string[] } = {};
  /**
   * Динамически извлекает заголовки из первой строки данных для указанного файла.
   * Кэширует результат для производительности.
   * @param filename Имя файла (ключ в объекте statisticsData)
   * @returns Массив строковых заголовков.
   */
  getHeaders(filename: string, data: StatisticsPayload): string[] {
    if (this.headersCache[filename]) {
      return this.headersCache[filename];
    }
    if (!data || !data[filename] || data[filename].length === 0) {
      return [];
    }
    const headers = Object.keys(data[filename][0]);
    this.headersCache[filename] = headers;
    return headers;
  }

  originalOrder = (a: KeyValue<string, any[]>, b: KeyValue<string, any[]>): number => {
    return 0;
  }

}