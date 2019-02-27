import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TiledCoreService } from '../tiled-core.service';
import { EventService } from '../event-service';

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


  constructor(public tiledCoreService : TiledCoreService,
              private eventService: EventService<any>) { }

  ngOnInit() {
  }

  resetMap() {
    this.eventService.dispatchEvent({ eventName: "resetMap"});
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
