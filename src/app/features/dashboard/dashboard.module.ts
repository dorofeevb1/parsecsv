import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { MultiCsvDownloaderComponent } from './multi-csv-downloader/multi-csv-downloader.component';
import { StatisticComponent } from './statistic/statistic.component';
import { ReportsComponent } from './reports/reports.component';
import { NgApexchartsModule } from "ng-apexcharts"; 

@NgModule({
    declarations: [
        MultiCsvDownloaderComponent,
        StatisticComponent,
        ReportsComponent
    ],
    imports: [
        CommonModule,
        DashboardRoutingModule,
        NgApexchartsModule
    ]
})
export class DashboardModule { }