import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { HttpErrorResponse } from '@angular/common/http';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8000/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService]
    });
    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Убеждаемся, что нет незавершенных запросов после каждого теста
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should perform a GET request', () => {
    const mockData = { id: 1, name: 'Test' };
    const endpoint = 'test';

    service.get(endpoint).subscribe(data => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${apiUrl}/${endpoint}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData); // Отправляем мок-ответ
  });

  it('should perform a POST request', () => {
    const mockData = { name: 'Test' };
    const mockResponse = { id: 1, name: 'Test' };
    const endpoint = 'test';

    service.post(endpoint, mockData).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/${endpoint}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockData);
    req.flush(mockResponse);
  });

  it('should handle HTTP errors', () => {
    const endpoint = 'error-endpoint';
    const errorMessage = 'Server error: 500 - Internal Server Error';
    const mockError = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
      error: 'Something went wrong'
    });

    service.get(endpoint).subscribe({
      next: () => fail('should have failed with the 500 error'),
      error: (error: Error) => {
        expect(error.message).toContain(errorMessage);
      }
    });

    const req = httpMock.expectOne(`${apiUrl}/${endpoint}`);
    req.flush('Something went wrong', { status: 500, statusText: 'Internal Server Error' });
  });
});