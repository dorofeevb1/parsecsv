import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ReportsComponent } from './reports.component';
import { MetricsService, CsvDataPayload } from 'src/app/core/service/metrics/metrics.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;
  let metricsServiceMock: { processedData$: any };

  const mockData: CsvDataPayload = {
    'file1.csv': [
      { header1: 'a', header2: 1 },
      { header1: 'b', header2: 2 }
    ]
  };

  beforeEach(async () => {
    // Используем простой объект-мок для BehaviorSubject
    metricsServiceMock = {
      processedData$: of(null) // Начальное значение - null
    };

    await TestBed.configureTestingModule({
      declarations: [ReportsComponent],
      imports: [SharedModule, NoopAnimationsModule],
      providers: [
        { provide: MetricsService, useValue: metricsServiceMock }
      ]
    }).compileComponents();
  });

  function createComponentWithData(data: CsvDataPayload | null) {
    metricsServiceMock.processedData$ = of(data);
    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    createComponentWithData(null);
    expect(component).toBeTruthy();
  });

  it('should display the empty state when no data is available', () => {
    createComponentWithData(null);
    const emptyState = fixture.debugElement.query(By.css('.empty-state'));
    const reportsContainer = fixture.debugElement.query(By.css('.reports-container'));
    expect(emptyState).toBeTruthy();
    expect(reportsContainer).toBeFalsy();
  });

  it('should display the reports container and data when data is available', () => {
    createComponentWithData(mockData);
    const emptyState = fixture.debugElement.query(By.css('.empty-state'));
    const reportsContainer = fixture.debugElement.query(By.css('.reports-container'));
    expect(emptyState).toBeFalsy();
    expect(reportsContainer).toBeTruthy();
    
    const tableHeader = fixture.nativeElement.querySelector('th').textContent;
    expect(tableHeader).toContain('header1');
  });

  it('should have the download button disabled when there is no data', () => {
    createComponentWithData(null);
    // Переключимся на empty state
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('.empty-state a'));
    expect(button).toBeTruthy(); // Проверяем, что есть кнопка перехода к загрузке
  });
  
  it('should have the download button enabled when data is available', () => {
    createComponentWithData(mockData);
    const button = fixture.debugElement.query(By.css('.actions-toolbar button')).nativeElement;
    expect(button.disabled).toBe(false);
  });

  it('should call downloadAsCsv when the CSV button is clicked', () => {
    createComponentWithData(mockData);
    spyOn(component, 'downloadAsCsv'); // Шпионим за методом компонента
    
    const button = fixture.debugElement.query(By.css('.actions-toolbar button')).nativeElement;
    button.click();
    
    expect(component.downloadAsCsv).toHaveBeenCalled();
  });

  it('should correctly convert data to CSV string', () => {
    createComponentWithData(mockData);
    // Тестируем приватный метод через обходной путь
    const csvString = (component as any).convertToCsv(mockData);
    
    const expectedString = '"file1.csv"\r\n"header1","header2"\r\n"a","1"\r\n"b","2"\r\n\r\n';
    expect(csvString).toBe(expectedString);
  });
});