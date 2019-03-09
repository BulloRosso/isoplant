import { Component, OnDestroy, ViewChild, ElementRef,  AfterViewInit } from '@angular/core';
import { IsoMapItem } from './model/iso-map-item';
import { TiledCanvasComponent } from './tiled-canvas/tiled-canvas.component';
import { EventService } from './event-service';
import { EventBadgeChanged } from './model/event-badge-changed';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


// this is an example host page containing different components of the tile editor
//
export class AppComponent implements AfterViewInit, OnDestroy {
  
  title = 'Tile Editor Sample Host Page';

  // test messaging
  messageType = "oee";
  messageToMachine = "L100-1";
  messageValue = "4";

  @ViewChild(TiledCanvasComponent) childCanvas: TiledCanvasComponent;
  selectedItem: IsoMapItem;
 
  itmSubscription;

  constructor(private eventService: EventService<EventBadgeChanged>) {
     
  }

  ngAfterViewInit() {

    this.itmSubscription = this.childCanvas.selectedItem.subscribe(itm => {
      console.log("HOST PAGE: received SELECTION FROM CANVAS: " + itm.type + " --> " + itm.name);
      this.selectedItem = itm;
    });

  }

  ngOnDestroy() {
    this.itmSubscription.unsubscribe();
  }

  testBadgeLiveUpdate() {
     
     this.eventService.dispatchEvent( new EventBadgeChanged( this.messageType, this.messageToMachine, this.messageValue ));
  }
}
