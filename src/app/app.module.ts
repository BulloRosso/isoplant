import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { TiledEditorComponent } from './tiled-editor/tiled-editor.component';
import { TiledControlsComponent } from './tiled-controls/tiled-controls.component';
import { TiledCanvasComponent } from './tiled-canvas/tiled-canvas.component';

@NgModule({
  declarations: [
    AppComponent,
 
    TiledEditorComponent,
    TiledControlsComponent,
    TiledCanvasComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
