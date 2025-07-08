import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;
  let store: { [key: string]: string } = {};

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);

    // Мокируем localStorage, чтобы не затрагивать реальное хранилище браузера
    spyOn(localStorage, 'getItem').and.callFake((key: string): string | null => {
      return store[key] || null;
    });
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string): void => {
      store[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake((key: string): void => {
      delete store[key];
    });
    spyOn(localStorage, 'clear').and.callFake(() => {
      store = {};
    });
  });

  afterEach(() => {
    // Очищаем мок-хранилище после каждого теста
    store = {};
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set an item in localStorage', () => {
    const key = 'testKey';
    const value = 'testValue';
    service.set(key, value);
    expect(localStorage.setItem).toHaveBeenCalledWith(key, value);
    expect(store[key]).toBe(value);
  });

  it('should get an item from localStorage', () => {
    const key = 'testKey';
    const value = 'testValue';
    store[key] = value; // Arrange
    const result = service.get(key); // Act
    expect(result).toBe(value); // Assert
    expect(localStorage.getItem).toHaveBeenCalledWith(key);
  });

  it('should return null if item does not exist', () => {
    const result = service.get('nonExistentKey');
    expect(result).toBeNull();
  });

  it('should remove an item from localStorage', () => {
    const key = 'testKey';
    store[key] = 'testValue'; // Arrange
    service.remove(key); // Act
    expect(localStorage.removeItem).toHaveBeenCalledWith(key); // Assert
    expect(store[key]).toBeUndefined();
  });

  it('should clear the localStorage', () => {
    store['key1'] = 'value1';
    store['key2'] = 'value2';
    service.clear();
    expect(localStorage.clear).toHaveBeenCalled();
    expect(store).toEqual({});
  });
});