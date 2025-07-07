import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { MultiCsvDownloaderComponent } from './multi-csv-downloader/multi-csv-downloader.component';
import { StatisticComponent } from './statistic/statistic.component';
import { ReportsComponent } from './reports/reports.component';

@NgModule({
    declarations: [
        MultiCsvDownloaderComponent,
        StatisticComponent,
        ReportsComponent
    ],
    imports: [
        CommonModule,
        DashboardRoutingModule
    ]
})
export class DashboardModule { }