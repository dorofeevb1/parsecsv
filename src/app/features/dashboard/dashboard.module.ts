import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { MultiCsvDownloaderComponent } from './multi-csv-downloader/multi-csv-downloader.component';
import { StatisticComponent } from './statistic/statistic.component';
import { ReportsComponent } from './reports/reports.component';
import { NgApexchartsModule } from "ng-apexcharts";
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
    declarations: [
        MultiCsvDownloaderComponent,
        StatisticComponent,
        ReportsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        DashboardRoutingModule,
        NgApexchartsModule,
        SharedModule
    ]
})
export class DashboardModule { }