import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { TiledCoreService } from '../tiled-core.service';
import { EventService } from '../event-service';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { stringify } from '@angular/core/src/util';

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
  statusColor:string;
  selLine:string;
  selWorkcenter:string;
  selMachine:string;
  layeredTileImages:string;
  badges:string;

  // Material chips control
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  badgesChips: string[] = [];

  // selected tile index
  cellIndex:string;

  // values for dropdown
  private tileTypes = [
      "conveyor",
      "machine",
      "machine_green",
      "paletts",
      "agv_south",
      "agv_west",
      "paletts_big",
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

  constructor(public tiledCoreService : TiledCoreService, 
              private eventService: EventService<any>) {
     
  }

  ngOnDestroy() {
    this.tileSubscription.unsubscribe();
  }

  ngOnInit() {

    // subscribe to selection of tile (global eventing)
    this.tileSubscription = this.eventService.events.subscribe(evt => {

        if (evt && evt["eventName"] && evt["eventName"] === "cellSelected") {

          this.cellIndex = evt["cellIndex"];
          var currentTile = this.tiledCoreService.getTileData(this.cellIndex);
          if (currentTile) {
            this.labelText = currentTile.labelText;
            if (currentTile.imgName && currentTile.imgName.indexOf(',') > -1) {
              this.layeredTileImages = currentTile.imgName;
              this.imageName = null;
            } else {
              this.imageName = currentTile.imgName;
              this.layeredTileImages = "";
            }
            this.backgroundColor = currentTile.backgroundColor;
            this.statusColor = currentTile.statusColor;
            if (currentTile.mapSelectionPath) {
              this.selLine = currentTile.mapSelectionPath.get("Line");
              this.selWorkcenter = currentTile.mapSelectionPath.get("Workcenter");
              this.selMachine = currentTile.mapSelectionPath.get("Machine");
            } else {
              this.selLine = "";
              this.selWorkcenter = "";
              this.selMachine = "";
            }
            if (currentTile.mapKpis) {
              this.badges = JSON.stringify(currentTile.mapKpis);
            } else {
              this.badges = "";
            }
            if (currentTile.mapKpis) {
              this.badgesChips = [];
              currentTile.mapKpis.forEach((value, key, map) => {
                 this.badgesChips.push(key + ":" + value);
              });
            } else {
              this.badgesChips = [];
            }
          }
        }
    }); 

     if (false) {
     // subscribe to selection of tile
     this.tileSubscription = this.tiledCoreService.tileData().subscribe(retMap => { 
       
      
      });
    }
  }

  saveTile() {
    var selData = this.tiledCoreService.getTileData(this.cellIndex);
    // modify
    selData.labelText = this.labelText;
    selData.backgroundColor = this.backgroundColor;
    selData.statusColor = this.statusColor;
    if (!this.selLine && !this.selWorkcenter && !this.selMachine) {
      selData.mapSelectionPath = null;
    } else {
      let selPath = new Map<string,string>();
      selPath.set("Line", this.selLine);
      selPath.set("Workcenter", this.selWorkcenter);
      selPath.set("Machine", this.selMachine);
      selData.mapSelectionPath = selPath;
    }
    if (this.layeredTileImages) {
      selData.imgName = this.layeredTileImages;
    } else {
      selData.imgName = this.imageName;
    }
    if (this.badgesChips) {
      selData.mapKpis = new Map<string,string>();
      this.badgesChips.forEach(itm => {
        selData.mapKpis.set(itm.split(":")[0],itm.split(":")[1]);
      });  
    } else {
      selData.mapKpis = null;
    }
    // update & trigger redraw
    this.tiledCoreService.setTileData(this.cellIndex, selData);
  }

  clearTile() {
    this.tiledCoreService.clearTileData(this.cellIndex);
    this.cellIndex = "";
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.badgesChips.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(badge: string): void {
    const index = this.badgesChips.indexOf(badge);

    if (index >= 0) {
      this.badgesChips.splice(index, 1);
    }
  }

}
