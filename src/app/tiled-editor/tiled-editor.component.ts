import { Component, OnInit } from '@angular/core';
import { TiledCoreService } from '../tiled-core.service';

@Component({
  selector: 'tiled-editor',
  templateUrl: './tiled-editor.component.html',
  styleUrls: ['./tiled-editor.component.css']
})
export class TiledEditorComponent implements OnInit {

  constructor(public tiledCoreService : TiledCoreService) { }

  ngOnInit() {
  }

  clearTile() {
    this.tiledCoreService.clearTileData(this.tiledCoreService.selectedTile);
  }

}
