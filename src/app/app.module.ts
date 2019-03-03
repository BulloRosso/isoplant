import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatButtonModule} from '@angular/material/button';
import { MatInputModule} from '@angular/material/input';
import { TiledEditorComponent } from './tiled-editor/tiled-editor.component';
import { TiledControlsComponent } from './tiled-controls/tiled-controls.component';
import { TiledCanvasComponent } from './tiled-canvas/tiled-canvas.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule, } from '@angular/material/button-toggle';
import { Ng2PanZoomModule } from 'ng2-panzoom';
import { EventService } from './event-service';
import { HttpClientModule } from '@angular/common/http';

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
    HttpClientModule,
    Ng2PanZoomModule
  ],
  providers: [  EventService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
