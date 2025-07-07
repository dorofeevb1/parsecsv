import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MultiCsvDownloaderComponent } from './multi-csv-downloader/multi-csv-downloader.component';
import { StatisticComponent } from './statistic/statistic.component';
import { ReportsComponent } from './reports/reports.component';

/**
 * Defines the routes specific to the Dashboard feature module.
 *
 * When the application is lazy-loaded at a path like '/dashboard',
 * these routes are appended to that base path.
 *
 * For example:
 * - A path of '' here will map to '/dashboard' in the browser.
 * - A path of 'settings' here will map to '/dashboard/settings'.
 */
const routes: Routes = [
    { path: '', redirectTo: 'csv', pathMatch: 'full' },
    {
        path: 'csv',
        component: MultiCsvDownloaderComponent,
        title: 'Dashboard | CSV Uploader' // Sets the browser tab title
    },
    {
        path: 'statistic',
        component: StatisticComponent,
        title: 'Dashboard/statistic' // Sets the browser tab title
    },
    {
        path: 'reports',
        component: ReportsComponent,
        title: 'Dashboard/reports' // Sets the browser tab title
    }
];

@NgModule({
    imports: [
        // Use forChild() in feature routing modules.
        // This registers the routes with the router service, but unlike forRoot(),
        // it does not create a new instance of the router service.
        RouterModule.forChild(routes)
    ],
    exports: [
        // Export RouterModule so that components in the DashboardModule
        // (like MultiCsvDownloaderComponent) can use router directives
        // like <router-outlet> and [routerLink].
        RouterModule
    ]
})
export class DashboardRoutingModule { }