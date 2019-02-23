import { Component, OnInit, Input } from '@angular/core';
import { TiledCoreService } from '../tiled-core.service';

@Component({
  selector: 'tiled-controls',
  templateUrl: './tiled-controls.component.html',
  styleUrls: ['./tiled-controls.component.css']
})
export class TiledControlsComponent implements OnInit {

  private _selectedKpi : string = "[Off]";

  get selectedKpi (): string {
    return this._selectedKpi;
  }

  @Input()
  set selectedKpi (val: string) {
      this._selectedKpi = val;
      this.showBullets(val);
  }

  constructor(public tiledCoreService : TiledCoreService) { }

  ngOnInit() {
  }

  zoomIn() {
    if (this.tiledCoreService.zoomLevel == 4) {
      return;
    } 
    this.tiledCoreService.incrementZoom();
    this.tiledCoreService.broadcastRefresh();
  }

  zoomOut() {
    if (this.tiledCoreService.zoomLevel == 1) {
      return;
    } 
    this.tiledCoreService.decrementZoom();
    this.tiledCoreService.broadcastRefresh();
  }

  showBullets(val) {
    
    if (val.toLowerCase() == "andon") {
      this.tiledCoreService.setBulletData({ color: "purple"});
    }
    if (val.toLowerCase() == "none") {
      this.tiledCoreService.setBulletData({ color: null });
    }
    if (val.toLowerCase() == "oee") {
      this.tiledCoreService.setBulletData({ color: "green" });
    }
    
    this.tiledCoreService.broadcastRefresh();
  }

}
