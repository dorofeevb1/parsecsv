// File: pars/src/app/features/dashboard/statistic/statistic.component.ts
import { KeyValue } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { MetricsService, CsvDataPayload as StatisticsPayload } from 'src/app/core/service/metrics/metrics.service';

// Импортируем все необходимые типы из ng-apexcharts для строгой типизации
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexStroke,
  ApexFill,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexTooltip,
  ApexPlotOptions,
  ApexYAxis
} from "ng-apexcharts";

// CORRECTED: Define required properties as non-optional.
export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  title: ApexTitleSubtitle;
  // --- Optional properties ---
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  subtitle?: ApexTitleSubtitle;
  dataLabels?: ApexDataLabels;
  stroke?: ApexStroke;
  fill?: ApexFill;
  legend?: ApexLegend;
  tooltip?: ApexTooltip;
  plotOptions?: ApexPlotOptions;
  responsive?: ApexResponsive[];
  labels?: any;
};

@Component({
  selector: 'app-statistic',
  templateUrl: './statistic.component.html',
  styleUrls: ['./statistic.component.scss']
})
export class StatisticComponent implements OnDestroy {
  private metricsService = inject(MetricsService);
  public statisticsData$: Observable<StatisticsPayload | null> = this.metricsService.processedData$;
  private dataSubscription: Subscription;

  // Свойства для хранения опций каждого из 6 графиков
  // Use ChartOptions directly now, as it correctly models optional properties.
  public barChartOptions?: ChartOptions;
  public pieChartOptions?: ChartOptions;
  public lineChartOptions?: ChartOptions;
  public scatterChartOptions?: ChartOptions;
  public bubbleChartOptions?: ChartOptions;
  public mixedChartOptions?: ChartOptions;


  // Логика для таблиц
  private headersCache: { [filename: string]: string[] } = {};

  constructor() {
    this.dataSubscription = this.statisticsData$.subscribe(data => {
      this.resetCharts(); // Очищаем старые графики
      if (data) {
        this.prepareAllChartData(data);
      }
    });
  }

  ngOnDestroy(): void {
    this.dataSubscription.unsubscribe();
  }
  
  private resetCharts(): void {
    this.barChartOptions = undefined;
    this.pieChartOptions = undefined;
    this.lineChartOptions = undefined;
    this.scatterChartOptions = undefined;
    this.bubbleChartOptions = undefined;
    this.mixedChartOptions = undefined;
  }

  private prepareAllChartData(data: StatisticsPayload): void {
    const allRows = Object.values(data).flat();

    this.barChartOptions = this.prepareBarChart(allRows);
    this.pieChartOptions = this.preparePieChart(allRows);
    this.lineChartOptions = this.prepareLineChart(allRows);
    this.scatterChartOptions = this.prepareScatterChart(allRows);
    this.bubbleChartOptions = this.prepareBubbleChart(allRows);
    this.mixedChartOptions = this.prepareMixedChart(allRows);
  }
  
  // --- МЕТОДЫ ПОДГОТОВКИ ДАННЫХ ДЛЯ КАЖДОГО ГРАФИКА ---

  private prepareBarChart(allRows: any[]): ChartOptions | undefined {
    const data = allRows.filter(row => row['Источник трафика'] && row['Просмотры']);
    if (data.length === 0) return this.createPlaceholderOptions('Столбчатая диаграмма', 'Нет данных по источникам трафика');
    
    const filtered = data.filter(item => item['Источник трафика'] !== 'Итоговое значение');
    return {
      series: [{ name: "Просмотры", data: filtered.map(item => item['Просмотры']) }],
      chart: { type: "bar", height: 350, toolbar: { show: true } },
      title: { text: "Просмотры по источникам трафика" },
      xaxis: { categories: filtered.map(item => item['Источник трафика']) }
    };
  }

  private preparePieChart(allRows: any[]): ChartOptions | undefined {
    const data = allRows.filter(row => row['География'] && row['Просмотры']);
    if (data.length === 0) return this.createPlaceholderOptions('Круговая диаграмма', 'Нет данных по географии');

    const filtered = data.filter(item => item['География'] !== 'Итоговое значение');
    return {
      series: filtered.map(item => item['Просмотры']),
      chart: { width: '100%', type: "pie" },
      labels: filtered.map(item => item['География']),
      title: { text: 'Просмотры по странам' },
      responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: "bottom" } } }]
    };
  }

  private prepareLineChart(allRows: any[]): ChartOptions | undefined {
    const data = allRows.filter(row => row['Дата'] && row['Просмотры']);
    if (data.length < 2) return this.createPlaceholderOptions('Линейный график', 'Недостаточно данных для динамики просмотров');

    return {
      series: [{ name: "Просмотры", data: data.map(item => item['Просмотры']) }],
      chart: { height: 350, type: "line", zoom: { enabled: true } },
      stroke: { curve: "smooth" },
      title: { text: "Динамика просмотров по дням" },
      xaxis: { type: 'datetime', categories: data.map(item => item['Дата']) }
    };
  }

  private prepareScatterChart(allRows: any[]): ChartOptions | undefined {
    const data = allRows.filter(row => row['Просмотры'] && row['Время просмотра (часы)']);
    if (data.length === 0) return this.createPlaceholderOptions('Диаграмма рассеяния', 'Нет данных для корреляции');

    const filtered = data.filter(item => item['Источник трафика'] !== 'Итоговое значение' && item['География'] !== 'Итоговое значение');
    return {
      series: [{
        name: "Источник/География",
        data: filtered.map(item => [item['Просмотры'], item['Время просмотра (часы)'].toFixed(2)])
      }],
      chart: { height: 350, type: 'scatter', zoom: { enabled: true } },
      title: { text: 'Корреляция просмотров и времени просмотра' },
      xaxis: { type: 'numeric', title: { text: 'Просмотры' } },
      yaxis: { title: { text: 'Время просмотра (часы)' } }
    };
  }
  
  private prepareBubbleChart(allRows: any[]): ChartOptions | undefined {
    const data = allRows.filter(row => row['Просмотры'] && row['Показы'] && row['CTR для значков видео (%)']);
    if (data.length === 0) return this.createPlaceholderOptions('Пузырьковая диаграмма', 'Нет данных с показами и CTR');
    
    const filtered = data.filter(item => item['Источник трафика'] !== 'Итоговое значение');
    return {
      series: [{
        name: 'Источники трафика',
        data: filtered.map(item => [
          item['Показы'],
          item['Просмотры'],
          parseFloat(String(item['CTR для значков видео (%)']).replace(',', '.')) // z-значение
        ])
      }],
      chart: { height: 350, type: 'bubble' },
      title: { text: 'Эффективность источников: Показы, Просмотры и CTR' },
      xaxis: { type: 'numeric', title: { text: 'Показы' } },
      yaxis: { title: { text: 'Просмотры' } },
      fill: { opacity: 0.8 },
    };
  }

  private prepareMixedChart(allRows: any[]): ChartOptions | undefined {
    const data = allRows.filter(row => row['Дата'] && row['Просмотры']);
    if (data.length < 2) return this.createPlaceholderOptions('Смешанный график', 'Недостаточно данных для динамики');

    // Рассчитаем скользящее среднее для сглаживания
    const movingAverage = data.map((_, i, arr) => {
        const slice = arr.slice(Math.max(0, i - 2), i + 1);
        return slice.reduce((acc, val) => acc + val['Просмотры'], 0) / slice.length;
    });

    return {
      series: [
        { name: 'Просмотры (Столбцы)', type: 'bar', data: data.map(item => item['Просмотры']) },
        { name: 'Тренд (Линия)', type: 'line', data: movingAverage.map(v => Math.round(v)) }
      ],
      chart: { height: 350, type: 'line' },
      title: { text: 'Просмотры и их тренд' },
      stroke: { width: [0, 4] }, // Ширина для столбцов и линии
      xaxis: { type: 'datetime', categories: data.map(item => item['Дата']) }
    };
  }
  
  /**
   * Создает "пустые" опции для графика, чтобы показать сообщение-заглушку.
   */
  private createPlaceholderOptions(titleText: string, subtitleText: string): ChartOptions {
    return {
        series: [],
        chart: { type: 'bar', height: 350, background: 'transparent' },
        title: { text: titleText, align: 'center' },
        subtitle: { text: subtitleText, align: 'center', style: { fontSize: '14px', color: '#999' } },
        xaxis: { categories: [] },
        yaxis: { show: false },
        plotOptions: { bar: { horizontal: false } },
        dataLabels: { enabled: false },
    };
  }

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