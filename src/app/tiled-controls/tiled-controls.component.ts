import { Component, OnInit } from '@angular/core';
import { TiledCoreService } from '../tiled-core.service';

@Component({
  selector: 'tiled-controls',
  templateUrl: './tiled-controls.component.html',
  styleUrls: ['./tiled-controls.component.css']
})
export class TiledControlsComponent implements OnInit {

  constructor(public tiledCoreService : TiledCoreService) { }

  ngOnInit() {
  }

  zoomIn() {
    this.tiledCoreService.incrementZoom();
    this.tiledCoreService.broadcastRefresh();
  }

  zoomOut() {
    this.tiledCoreService.decrementZoom();
    this.tiledCoreService.broadcastRefresh();
  }

  showBullets(val) {
    if (val == "andon") {
      this.tiledCoreService.setBulletData({ color: "purple"});
    }
    if (val == "none") {
      this.tiledCoreService.setBulletData({ color: null });
    }
    if (val == "oee") {
      this.tiledCoreService.setBulletData({ color: "green" });
    }
    
    this.tiledCoreService.broadcastRefresh();
  }

}
