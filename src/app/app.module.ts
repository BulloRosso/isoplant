import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// this project's stars
import { TiledEditorComponent } from './tiled-editor/tiled-editor.component';
import { TiledControlsComponent } from './tiled-controls/tiled-controls.component';
import { TiledCanvasComponent } from './tiled-canvas/tiled-canvas.component';

// Angular Material
import { MatButtonModule} from '@angular/material/button';
import { MatInputModule} from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule, } from '@angular/material/button-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

import { D3Service } from 'd3-ng2-service'; 

// helpers
import { EventService } from './event-service';
import { HttpClientModule } from '@angular/common/http';
import { NgIsomapViewerModule } from 'projects/ng-isomap-viewer/src/public_api';

@NgModule({
  declarations: [
    AppComponent,
    TiledEditorComponent,
    TiledControlsComponent,
    TiledCanvasComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
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
    HttpClientModule,
    NgIsomapViewerModule
  ],
  providers: [  EventService, D3Service ],
  bootstrap: [AppComponent]
})
export class AppModule { }
