import { Component, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MetricsService } from 'src/app/core/service/metrics/metrics.service';

// Define the type for the payload being sent to the service.
// It's a dictionary where keys are filenames and values are the parsed JSON arrays.
type AllFilesPayload = { [filename: string]: any[] };

@Component({
  selector: 'multi-csv-downloader.component',
  templateUrl: './multi-csv-downloader.component.html',
  styleUrls: ['./multi-csv-downloader.component.scss']
})
export class MultiCsvDownloaderComponent {
  private metricsService = inject(MetricsService);

  readonly MAX_FILES = 3;
  selectedFiles: File[] = [];
  isLoading = false;
  statusMessage = '';
  isError = false;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    this.isError = false;
    this.statusMessage = '';
    const newFiles = Array.from(input.files);
    
    if (this.selectedFiles.length + newFiles.length > this.MAX_FILES) {
      this.isError = true;
      this.statusMessage = `Ошибка: можно выбрать не более ${this.MAX_FILES} файлов.`;
      input.value = '';
      return;
    }

    this.selectedFiles.push(...newFiles);
    input.value = '';
  }

  removeFile(fileToRemove: File): void {
    this.selectedFiles = this.selectedFiles.filter(file => file !== fileToRemove);
  }

  async processAndSendData(): Promise<void> {
    if (this.selectedFiles.length === 0) return;

    this.isLoading = true;
    this.isError = false;
    this.statusMessage = 'Начинаем обработку файлов...';
    const jsonDataPayload: AllFilesPayload = {};

    try {
      this.statusMessage = '1/2: Чтение и преобразование файлов в JSON...';
      const readPromises = this.selectedFiles.map(file => this.readFileAsText(file));
      const fileContents = await Promise.all(readPromises);

      for (let i = 0; i < this.selectedFiles.length; i++) {
        const file = this.selectedFiles[i];
        const content = fileContents[i];
        
        console.log(`Парсинг файла: ${file.name}`);
        const jsonData = this.parseCsvToJson(content);
        jsonDataPayload[file.name] = jsonData;
      }
      console.log('Итоговый JSON для отправки:', jsonDataPayload);
      
      this.statusMessage = '2/2: Отправка данных на сервер...';
      // CORRECTED: The method is named `sendData` in the updated service.
      await firstValueFrom(this.metricsService.sendData(jsonDataPayload));

      this.statusMessage = 'Готово! Данные успешно отправлены.';
      this.selectedFiles = [];
    } catch (error) {
      this.isError = true;
      this.statusMessage = `Ошибка: ${error instanceof Error ? error.message : 'Не удалось завершить операцию.'}`;
      console.error('Произошла ошибка:', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file, 'UTF-8');
    });
  }
  
  /**
   * CORRECTED: A more robust CSV parser that handles commas within quoted fields
   * and escaped quotes ("").
   */
  private parseCsvToJson(csvContent: string): any[] {
    const lines = csvContent.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const splitCsvLine = (line: string): string[] => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"' && inQuotes && nextChar === '"') {
          current += '"'; // Handle escaped quote ""
          i++; // Skip next character
        } else if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current);
      return result;
    };

    const headers = splitCsvLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, ''));
    const jsonData = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const cells = splitCsvLine(line);
      if (cells.length !== headers.length) {
        console.warn(`Skipping malformed CSV line ${i + 1}: column count mismatch.`);
        continue;
      }

      const rowObject: { [key: string]: any } = {};
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j];
        const value = (cells[j] || '').trim().replace(/^"|"$/g, '');
        
        const numericValue = parseFloat(value.replace(',', '.'));
        
        if (!isNaN(numericValue) && isFinite(numericValue) && value.trim() !== '') {
            rowObject[header] = numericValue;
        } else {
            rowObject[header] = value;
        }
      }
      jsonData.push(rowObject);
    }
    return jsonData;
  }
}