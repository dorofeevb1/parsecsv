// src/app/shared/shared.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Angular Material Modules (только используемые)
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Для MatDatepicker (требует дополнительных провайдеров)
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HeaderComponent } from './components/header/header.component';
import { RouterModule } from '@angular/router';

const MATERIAL_MODULES = [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatMenuModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    RouterModule,
    MatNativeDateModule // Required for MatDatepicker
];

@NgModule({
    declarations: [
        HeaderComponent
    ],
    imports: [
        CommonModule,
        ...MATERIAL_MODULES
    ],
    exports: [
        CommonModule,
        HeaderComponent,
        ...MATERIAL_MODULES
    ],
    providers: [
        MatDatepickerModule // Провайдер для MatDatepicker
    ]
})
export class SharedModule { }