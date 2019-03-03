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
      if (val == "none") {
        this.eventService.dispatchEvent({eventName: "selectedBadgeType", value: null});
      } else {
        this.eventService.dispatchEvent({eventName: "selectedBadgeType", value: val});
      }
  }


  constructor(public tiledCoreService : TiledCoreService,
              private eventService: EventService<any>) { }

  ngOnInit() {
    
  }

  resetMap() {
    this.eventService.dispatchEvent({ eventName: "resetMap"});
  }

}
