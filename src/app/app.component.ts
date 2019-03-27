import {
  Component,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { IsoMapItem } from './model/iso-map-item';
import { TiledCanvasComponent } from './tiled-canvas/tiled-canvas.component';
import { EventService } from './event-service';
import {
  EventBadgeChanged,
  EventTileEditCompleted,
  EventCellSelected,
  Event
} from './model/event-badge-changed';
import { MatSidenav } from '@angular/material/sidenav';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

// this is an example host page containing different components of the tile editor
//
export class AppComponent implements AfterViewInit, OnDestroy {
  title = 'Tile Editor Sample Host Page';

  editMode = false;

  // test messaging
  messageType = 'oee';
  messageToMachine = 'L100-1';
  messageValue = '4';

  @ViewChild('drawerLeft') drawerLeft: MatSidenav;
  @ViewChild('drawerRight') drawerRight: MatSidenav;
  @ViewChild('editModeSlider') editModeSlider: MatSlideToggle;
  @ViewChild(TiledCanvasComponent) childCanvas: TiledCanvasComponent;
  selectedItem: IsoMapItem;

  itmSubscription;
  evtSubscription;

  constructor(private eventService: EventService) {}

  ngAfterViewInit() {
    // this is a REAL HIT (regular mode)
    this.itmSubscription = this.childCanvas.selectedItem.subscribe(itm => {
      if (!this.editModeSlider.checked) {
        console.log(
          'HOST PAGE: received HIT FROM CANVAS: ' +
            itm.type +
            ' --> ' +
            itm.name
        );
      }
    });

    this.evtSubscription = this.eventService.events.subscribe((evt: Event) => {
      if (evt.eventName === 'tileEditCompleted') {
        this.drawerLeft.close();
      }

      // this is a cell selected (edit mode)
      if (evt.eventName === 'cellSelected') {
        const cellSelected = evt as EventCellSelected;
        if (this.editModeSlider.checked) {
          console.log(
            'HOST PAGE: received SELECTION FROM CANVAS: ' +
              cellSelected.cellIndex
          );

          this.selectedItem = {
            type: '',
            name: '',
            id: cellSelected.cellIndex
          };

          this.drawerLeft.open();
        }
      }
    });
  }

  ngOnDestroy() {
    this.itmSubscription.unsubscribe();
    this.evtSubscription.unsubscribe();
  }

  testBadgeLiveUpdate() {
    this.eventService.dispatchEvent({
      eventName: 'kpiChanged',
      eventType: this.messageType,
      eventTarget: this.messageToMachine,
      eventValue: this.messageValue
    });

    this.drawerRight.close();
  }
}
