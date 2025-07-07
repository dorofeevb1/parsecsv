import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiCsvDownloaderComponent } from './multi-csv-downloader.component';

describe('MultiCsvDownloaderComponent', () => {
  let component: MultiCsvDownloaderComponent;
  let fixture: ComponentFixture<MultiCsvDownloaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MultiCsvDownloaderComponent]
    });
    fixture = TestBed.createComponent(MultiCsvDownloaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
