import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { TiledCoreService } from '../tiled-core.service';

@Component({
  selector: 'tiled-editor',
  templateUrl: './tiled-editor.component.html',
  styleUrls: ['./tiled-editor.component.css']
})
export class TiledEditorComponent implements OnInit, OnDestroy {

  // editor pane controls
  imageName: string;
  labelText: string;
  backgroundColor: string;

  // values for dropdown
  private tileTypes = [
      "conveyor",
      "machine",
      "machine_green",
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

  private tileSubscription;

  constructor(public tiledCoreService : TiledCoreService, private change: ChangeDetectorRef) {
     
  }

 

  ngOnDestroy() {
    this.tileSubscription.unsubscribe();
  }

  saveTile() {
    var selData = this.tiledCoreService.getTileData(this.tiledCoreService.selectedTile);
    // modify
    selData.imgName = this.imageName;
    selData.labelText = this.labelText;
    selData.backgroundColor = this.backgroundColor;
    // update & trigger redraw
    this.tiledCoreService.setTileData(this.tiledCoreService.selectedTile, selData);
  }

  ngOnInit() {
     // subscribe to selection of tile
     this.tileSubscription = this.tiledCoreService.tileData().subscribe(retMap => { 
       
      var currentTile = this.tiledCoreService.getTileData(this.tiledCoreService.selectedTile);
      if (currentTile) {
        this.labelText = currentTile.labelText;
        this.imageName = currentTile.imgName;
        this.backgroundColor = currentTile.backgroundColor;
        this.change.markForCheck();
      }
   });
  }

  clearTile() {
    this.tiledCoreService.clearTileData(this.tiledCoreService.selectedTile);
  }

}
