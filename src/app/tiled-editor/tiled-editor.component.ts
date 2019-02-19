import { Component, OnInit } from '@angular/core';
import { TiledCoreService } from '../tiled-core.service';

@Component({
  selector: 'tiled-editor',
  templateUrl: './tiled-editor.component.html',
  styleUrls: ['./tiled-editor.component.css']
})
export class TiledEditorComponent implements OnInit {

  imageName: string;
  labelText: string;

  private tileTypes = [
      "conveyor",
      "machine",
      "paletts",
      "road_crossroad",
      "road_crossroad_e_s_w",
      "road_crossroad_east",
      "road_crossroad_n_e_s",
      "road_crossroad_north",
      "road_crossroad_s_w_n",
      "road_crossroad_south",
      "road_crossroad_w_n_e",
      "road_crossroad_west",
      "road_crossroad_west",
      "road_left",
      "road_right",
      "shelf_left",
      "shelf_right",
      "wall_left",
      "wall_right",
      "warehouse"
  ];

  constructor(public tiledCoreService : TiledCoreService) {
    
   }

  saveTile() {
    var selData = this.tiledCoreService.getTileData(this.tiledCoreService.selectedTile);
    // modify
    selData.imgName = this.imageName;
    selData.labelText = this.labelText;
    // update & trigger redraw
    this.tiledCoreService.setTileData(this.tiledCoreService.selectedTile, selData);
  }

  ngOnInit() {
  }

  clearTile() {
    this.tiledCoreService.clearTileData(this.tiledCoreService.selectedTile);
  }

}
