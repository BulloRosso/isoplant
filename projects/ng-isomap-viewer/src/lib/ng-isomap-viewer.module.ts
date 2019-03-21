import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';

import { NgIsomapViewerComponent } from './ng-isomap-viewer.component';
import { CommonModule } from '@angular/common';
import { D3Service } from 'd3-ng2-service';

@NgModule({
  declarations: [NgIsomapViewerComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatOptionModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatToolbarModule,
    MatCardModule,
    MatChipsModule,
    MatTabsModule,
    MatSidenavModule,
    MatSlideToggleModule,
    HttpClientModule
  ],
  providers: [ D3Service ],
  exports: [NgIsomapViewerComponent]
})
export class NgIsomapViewerModule { }
