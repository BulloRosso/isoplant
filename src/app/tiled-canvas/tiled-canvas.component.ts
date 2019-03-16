import { Component, OnInit, OnDestroy, ElementRef, Renderer, ViewChild, Renderer2, AfterViewInit, ViewChildren, ContentChild, HostListener } from '@angular/core';
import { TiledCoreService } from '../tiled-core.service';
import { TileData } from '../model/tile-data';
import { Subscription, Subject } from 'rxjs';
import { Observable, BehaviorSubject } from 'rxjs';
import { IsoMapItem } from '../model/iso-map-item';
import { EventService } from '../event-service';
// animations https://www.npmjs.com/package/ng-animate
import { trigger, transition, useAnimation, state, style } from '@angular/animations';
import { flipInX, flipOutX } from 'ng-animate';
import { EventBadgeChanged } from '../model/event-badge-changed';
import { D3Service, D3, Selection } from 'd3-ng2-service';
import { zoom } from 'd3-ng2-service/src/bundle-d3';

@Component({
  selector: 'tiled-canvas',
  templateUrl: './tiled-canvas.component.html',
  styleUrls: ['./tiled-canvas.component.css'],
  animations: [
    trigger('zoomStatus', [
      state('invisible', style({
        transform: "rotateX(90deg)" 
      })),
      state('visible', style({
        transform: 'rotateX(0deg)'
      })),
      transition('invisible => visible', useAnimation(flipInX, {})),
      transition('visible => invisible', useAnimation(flipOutX))
     ])
  ],
})
// 
//   Simple Isometric Renderer inspired by http://nick-aschenbach.github.io/assets/2015-02-25-isometric-tile-engine/isometric02/js/isometric.js
//
export class TiledCanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  
  zoomIn: string = "invisible";

  private grid = {
    Xtiles: 10,
    Ytiles: 10,
    
    tileColumnOffset: 80, // pixels
    tileRowOffset: 40,    // pixels
    
    selectedTileX: -1,
    selectedTileY: -1,
    
    showCoordinates: false, // only to learn how axis values are set
    showOutlines: false, // show borders - helps to align svgs and debug
    
    style: {
      tileColor: "#ccc"
    },
    
    badgeGlowEffect: true, // corona effect for non-number badges
    badgeColor: null,
    tileMap: new Map<string,TileData>() 
  };
  
  event: MouseEvent;
  @ViewChild('tileCanvas') canvasRef:ElementRef;
  private canvas; 
  private context; 
  private d3: D3;
  private zoom; // d3 instance of zoom
  private zoomIdentity;
  private zoomFactor = 1;
  private translateX = 0;
  private translateY = 0;

  private tileSubscription;
  private badgeSubscription;

  // stuff for moving the canvas inside the outer div (viewport)
  private lastX = 0;
  private lastY = 0;
  private currentPanZoomFactor = 0;
  
  public selectUnitType: string = "Line";
  public unitTypes = [ "Line", "Workcenter", "Machine", "Cell" ];
  
  public selectArea: string = "Plant";
  public areaTypes = [ "Plant", "Milling area", "Finished goods", "Machine L100-3" ];
  
  // make observable (THIS IS FOR THE HOST PAGE)
  private _selectedItem = new Subject<IsoMapItem>();
  public selectedItem: Observable<IsoMapItem> = this._selectedItem.asObservable();
  private ownSelectedItemSubscription;
  private ownSelectedItem: IsoMapItem;

  // make observable (THIS IS FOR THE EDITOR COMPONENT)
  private _selectedCell = new Subject<TileData>();
  public selectedCell: Observable<TileData> = this._selectedCell.asObservable();
  
  private selectedBadgeType = null;

  // internal state
  private selectedObjectName = "";
  private selectedObjectType = "";
  
  constructor(private tiledCoreService : TiledCoreService,
              d3Service: D3Service, 
              private eventService: EventService<any>) { 
       this.d3 = d3Service.getD3();
  }
  
  imagesReady() {
    // preloading finished by browser
    this.redrawTiles(this.tiledCoreService.allTileData(), this.translateX, this.translateY);
  }
  
  ngAfterViewInit() {
    
   // this.redrawTiles(this.tiledCoreService.allTileData());
    this.zoomIdentity = this.d3.zoomIdentity.translate(this.canvasRef.nativeElement.offsetWidth / 2, this.canvasRef.nativeElement.offsetHeight / 2).scale(1); 

    this.zoom =this.d3.zoom().scaleExtent([1, 4]);

    let selCanvas = this.d3.select("canvas").call(this.zoom.on("zoom", () => {
    
      this.canvas = this.canvasRef.nativeElement;
      this.context =  this.canvas.getContext("2d");

      this.zoomIdentity = this.d3.event.transform;
      this.translateX = this.zoomIdentity.x;
      this.translateY = this.zoomIdentity.y;
      this.zoomFactor = this.zoomIdentity.k;

      this.redrawTiles(this.tiledCoreService.allTileData(), this.zoomIdentity.x, this.zoomIdentity.y);
 
    }));

    selCanvas.on("dblclick.zoom", null); // otherwise user zooms in quite deep with accidential double-click
    
  }
  
  ngOnInit() {
    
    let d3 = this.d3; 

    // TODO fixed URL for demo purposes
    this.tiledCoreService.loadData("http://localhost:4200/assets/sample-data/tilemap.json");

    this.eventService.events.subscribe(evt => {
      
      if (evt && evt["eventName"]) {
        if (evt["eventName"] === "resetMap") {

          this.zoomFactor =1;
          this.translateX = 0;
          this.translateY = 0;
          this.zoomIdentity = d3.zoomIdentity.translate(0,0).scale(1);
          
          this.d3.select("canvas").transition().duration(750).call(this.zoom.transform, d3.zoomIdentity.translate(0,0).scale(1));

        }
        if (evt["eventName"] === "selectedBadgeType") {
          this.selectedBadgeType = evt["value"];
          if (this.selectedBadgeType === "oee") {
            this.grid.badgeColor = "purple";
          } else {
            this.grid.badgeColor = "green";
          }
          this.redrawTiles( this.tiledCoreService.allTileData(), this.translateX, this.translateY);
        }

        // live update of overlay values
        if (evt instanceof EventBadgeChanged) {

          let evtT : EventBadgeChanged = evt;

          this.tiledCoreService.allTileData().forEach(itm => {
            if (itm.mapSelectionPath) {
              
              if (itm.mapSelectionPath["Machine"] && itm.mapSelectionPath["Machine"] === evtT.eventTarget) {
              
                if (itm.mapKpis) {
                  itm.mapKpis[evt.eventType] = evtT.eventValue;
                } else {
                  itm.mapKpis = {};
                  itm.mapKpis[evt.eventType] = evt.eventValue;
                }
                this.redrawTiles(this.tiledCoreService.allTileData(), this.translateX, this.translateY);

              } 
            }
          });
          
        } // kpi changed
      }
    });

    this.tileSubscription = this.tiledCoreService.tileData().subscribe(retMap => { 
      if (this.canvasRef) {
        this.redrawTiles(this.tiledCoreService.allTileData(), this.translateX, this.translateY);
      }
    });

    this.ownSelectedItemSubscription = this.selectedItem.subscribe(itm => {
        this.ownSelectedItem = itm;
    });
   
  }

  ngOnDestroy() {
    this.tileSubscription.unsubscribe();
    this.ownSelectedItemSubscription.unsubscribe();
    this.badgeSubscription.unsubscribe();
   
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.redrawTiles(this.tiledCoreService.allTileData(), this.translateX, this.translateY);
  }

  // select a tile AND an object according toe the header preferences
  //
  onClick(event: MouseEvent): void {

    this.ownSelectedItem = null; // clear previous selection
                                              
    // consider zoomFactor + responsive width
    let tileColumnOffset = this.canvas.offsetWidth / this.grid.Xtiles * this.zoomFactor ;
    let tileRowOffset = this.grid.tileColumnOffset / 2;
    let correctY = (this.grid.Ytiles / 2 * tileRowOffset);

    // position of mouse-pointer: click-location on page - pan position - canvas position on page
    var pageX = (event.clientX - this.translateX - this.canvas.offsetLeft) - tileColumnOffset / 2;
    var pageY = (event.clientY- (this.translateY + correctY) - this.canvas.offsetTop) - tileRowOffset / 2;

    // tile index
    var tileX = Math.round(pageX / tileColumnOffset - pageY / tileRowOffset);
    var tileY = Math.round(pageX / tileColumnOffset + pageY / tileRowOffset);
    
    // check bounds  
    if (tileX < 0 || tileY < 0 || tileX >= this.grid.Xtiles || tileY >= this.grid.Ytiles) {
      return; 
    }
     
    // now we have a valid hit
    this.grid.selectedTileX = tileX;
    this.grid.selectedTileY = tileY;
    
    // let's look what is selected and trigger a event for child compontens
    var newTile;
    
    if (!this.tiledCoreService.getTileData(tileX + "," + tileY)) {
      newTile = new TileData();
      newTile.coordinate = tileX + "," + tileY;
      this.tiledCoreService.setTileData(tileX + "," + tileY, newTile);
    } else {
      newTile = this.tiledCoreService.getTileData(tileX + "," + tileY);
    }
    
    this.eventService.dispatchEvent({"eventName": "cellSelected", "cellIndex": tileX + "," + tileY});
    this._selectedCell.next(newTile); // signal to editor (if present)
    
    this.tiledCoreService.selectedTile = tileX + "," + tileY;
    
    let selTileData =  this.tiledCoreService.getTileData(this.tiledCoreService.selectedTile);
    
    // Default: the cell that was hit
    //
    this.selectedObjectName = "[" + tileX + "," + tileY + "]";
    
    if (selTileData.mapSelectionPath) {
      if ( this.selectUnitType === "Workcenter" || this.selectUnitType === "Line") {
        // look for object type to select
        let hit = selTileData.mapSelectionPath[this.selectUnitType];
        if (hit) {
          // this property is the real result of the component
          this.selectedObjectName = hit;
          this.selectedObjectType = this.selectUnitType;
          
          // notify client subscribers (e. g. host page)
          let itm : IsoMapItem = new IsoMapItem();
          itm.name = this.selectedObjectName;
          itm.type = this.selectedObjectType;
          this._selectedItem.next(itm); // signal to host page
        } 
      } else {
        // example: show machine properties
        let hit = selTileData.mapSelectionPath[this.selectUnitType];
        if (hit) {
          this.selectedObjectName = hit;
          this.selectedObjectType = this.selectUnitType;
          // hint: this could also be triggered by the event (e. g. to open an off-canvas menu)
          this.zoomIn = "visible";
        }
      }
    }
    
    this.redrawTiles(this.tiledCoreService.allTileData(), this.translateX, this.translateY);
  }
  
  redrawTiles(tileData: Map<string, TileData>, translateX, translateY) {
    
    if (!this.canvasRef) {
      return;
    }
    
    this.canvas = this.canvasRef.nativeElement;
    this.context =  this.canvas.getContext("2d");
    
    // HOW MANY PIXELS DOES THE CANVAS "CONTAIN"? --> 1px:1unit 
    this.canvas.height = this.canvas.offsetHeight;
    this.canvas.width = this.canvas.offsetWidth;
    // if you don't adjust the canvas-properties this way it will be pixelated! 

    this.context.clearRect(0, 0, this.canvas.offsetWidth, this.canvas.offsetHeight);

    this.context.save();

    this.grid.tileColumnOffset = this.canvas.offsetWidth / this.grid.Xtiles * this.zoomFactor ;
    this.grid.tileRowOffset = this.grid.tileColumnOffset / 2;

    // move origin vertically
    translateY = translateY + ( this.grid.Ytiles / 2 * this.grid.tileRowOffset);

    //console.log({ "zoom ": this.zoomFactor, "tileColumnOffset": this.grid.tileColumnOffset, "tX": this.translateX, "ty": this.translateY})

    // first pass: Images
    for(var Xi = (this.grid.Xtiles - 1); Xi >= 0; Xi--) {
      for(var Yi = 0; Yi < this.grid.Ytiles; Yi++) {
        this.drawTile(Xi, Yi, tileData.get(Xi + "," + Yi), translateX, translateY);
      }
    }
    
    // second pass: text & badges
    for(var Xi = (this.grid.Xtiles - 1); Xi >= 0; Xi--) {
      for(var Yi = 0; Yi < this.grid.Ytiles; Yi++) {
        this.drawTileText(Xi, Yi, tileData.get(Xi + "," + Yi), translateX, translateY);
      }
    }
    
    // TEST
    // this.drawText("ISOMETRIC PLANT VIEW",550,-110);
    
    this.context.restore();
 
  }
  
  drawTileText(Xi, Yi, tileData: TileData, translateX, translateY) {
    
    var offX = Xi * this.grid.tileColumnOffset / 2 + Yi * this.grid.tileColumnOffset / 2 + translateX;
    var offY = Yi * this.grid.tileRowOffset / 2 - Xi * this.grid.tileRowOffset / 2  + translateY;
    
    let responsiveFactor = this.grid.tileColumnOffset / 80;

    if (tileData) {
      
      if (tileData.labelText && this.zoomFactor > 1) {
        this.drawText(tileData.labelText, 
          offX + this.grid.tileColumnOffset / 3.2, 
          offY + this.grid.tileRowOffset / 1.4, 
          6 * responsiveFactor);
        }
        
        if (tileData.imgName) {
          
          if (tileData.statusColor) {
            this.drawImage(offX, offY, tileData.imgName + "_" + tileData.statusColor);
          } else {
            this.drawImage(offX, offY, tileData.imgName);
          }
          
          if (this.selectedBadgeType && tileData.mapKpis) {
            
            const kpiVal = tileData.mapKpis[this.selectedBadgeType];
            
            if (kpiVal) {

              var reg = /^\d+$/;
              let containsNumber = reg.test(kpiVal);

              // Circle
              if (containsNumber) {
                this.context.fillStyle = this.grid.badgeColor;
              } else {
                this.context.fillStyle = kpiVal;
              }
              this.context.save();
              this.context.beginPath();
              
              if (this.grid.badgeGlowEffect && !containsNumber) {
                // glow effect ;-)
                this.context.shadowBlur = 30 * responsiveFactor;
                this.context.shadowColor = kpiVal;
              }

              this.context.strokeStyle = "#fff";
              this.context.lineWidth = 1 * responsiveFactor;

              this.context.arc(offX + 70 * responsiveFactor , offY + 10 * responsiveFactor , 
                8 * responsiveFactor , 0, 2 * Math.PI, true);
                this.context.closePath(); 
                this.context.fill();
                this.context.stroke();
                
              // Text
              if (containsNumber) {
                this.context.font = 8 * responsiveFactor  + "px Verdana";
                this.context.fillStyle = "white";
                this.context.textAlign = 'center';
                this.context.fillText(kpiVal, offX + 70 * responsiveFactor , offY + 13 * responsiveFactor );
              }
              this.context.restore();
              }
            }
          }
        }
      }
      
      drawTile(Xi, Yi, tileData: TileData, translateX, translateY) {
        
        var offX = Xi * this.grid.tileColumnOffset / 2 + Yi * this.grid.tileColumnOffset / 2 +  translateX;
        var offY = Yi * this.grid.tileRowOffset / 2 - Xi * this.grid.tileRowOffset / 2 +  translateY;
        
        let indirectHit = false;

        // Draw tile interior
        if( Xi == this.grid.selectedTileX && Yi == this.grid.selectedTileY) {
          // selected state (direct hit)
          this.context.fillStyle = 'yellow';
        } else {

          if (tileData && tileData.mapSelectionPath && this.ownSelectedItem) {
            // part of type-based-selection?
            if (tileData.mapSelectionPath[this.selectUnitType]) {
               if (tileData.mapSelectionPath[this.selectUnitType] == this.ownSelectedItem.name) {
                  // selected state (indirect hit)
                  this.context.fillStyle = '#FFFFCC'; // light yellow
                  indirectHit = true;
               }
            }
          } 
          if (!indirectHit) {
            if (tileData && tileData.backgroundColor) {
              // custom background
              this.context.fillStyle = tileData.backgroundColor;
            } else {
              // regular background
              this.context.fillStyle = this.grid.style.tileColor;
            }
          }

        } // direct hit
        
        this.context.beginPath();
        this.context.moveTo(offX, offY + this.grid.tileRowOffset / 2);
        this.context.lineTo(offX + this.grid.tileColumnOffset / 2, offY);
        this.context.lineTo( offX + this.grid.tileColumnOffset, offY + this.grid.tileRowOffset / 2);
        this.context.lineTo(offX + this.grid.tileColumnOffset, offY + this.grid.tileRowOffset / 2);
        this.context.lineTo(offX + this.grid.tileColumnOffset / 2, offY + this.grid.tileRowOffset);
        this.context.lineTo(offX + this.grid.tileColumnOffset / 2, offY + this.grid.tileRowOffset);
        this.context.lineTo(offX, offY + this.grid.tileRowOffset / 2);
        this.context.fill();
        this.context.closePath();
        
        // Draw tile outline
        var color = "#ccc";
        if (tileData && tileData.backgroundColor) {
          // avoid background bleeding through
          color = tileData.backgroundColor;
        }
        if (this.grid.showOutlines) {
          color = '#999';
        } 
        if (indirectHit) {
          color = "#FFFFCC"; // light yellow
        }
        this.drawLine(offX, offY + this.grid.tileRowOffset / 2, offX + this.grid.tileColumnOffset / 2, offY, color);
        this.drawLine(offX + this.grid.tileColumnOffset / 2, offY, offX + this.grid.tileColumnOffset, offY + this.grid.tileRowOffset / 2, color);
        this.drawLine(offX + this.grid.tileColumnOffset, offY + this.grid.tileRowOffset / 2, offX + this.grid.tileColumnOffset / 2, offY + this.grid.tileRowOffset, color);
        this.drawLine(offX + this.grid.tileColumnOffset / 2, offY + this.grid.tileRowOffset, offX, offY + this.grid.tileRowOffset / 2, color);
        
        if(this.grid.showCoordinates) {
          this.context.fillStyle = '#990000';
          this.context.fillText(Xi + ", " + Yi, offX + this.grid.tileColumnOffset/2 - 9, offY + this.grid.tileRowOffset/2 + 3);
        }
        
      }
      
      // example: How to focus/zoom entity on map?
      focusTo(event) {

        let bound1: string = "";
        let bound2: string = "";
  
        // TODO create some kind of JSON representation
        switch (event.value) {
          case "Plant":
            bound1 = "0,0";  // edge case (maximal)
            bound2 = "9,9";
            break;
          case "Milling area":
            bound1 = "0,7";
            bound2 = "1,9";
            break;
          case "Finished goods":
            bound1 = "7,1";
            bound2 = "8,2";
            break;
          case "Machine L100-3":
            bound1 = "1,2"; // edge case (minimal)
            bound2 = "1,2";
            break;
        }
        console.log("BOUNDS for " + event.value + ": " + bound1 + "--" + bound2);
        // TODO create event, so that the selection can be triggered from outside the component
        this.focusEntity(bound1, bound2);
        
      }

      // zoom and pan on rectangle(bound1x,bound1y, bound2x, bound2y) <-- tile coordinates
      focusEntity(bound1: string, bound2: string) {

        // dimensions of the area which has to be zoomed

        let tileColumnOffset = this.canvasRef.nativeElement.offsetWidth / this.grid.Xtiles; 
        let tileRowOffset = tileColumnOffset / 2;


        let Xi = parseInt(bound1.split(",")[0]);
        let Yi = parseInt(bound1.split(",")[1]);

        let Xj = parseInt(bound2.split(",")[0]);
        let Yj = parseInt(bound2.split(",")[1]);

        var offX1 = Xi * tileColumnOffset / 2 + Yi * tileColumnOffset / 2 ;
        var offY1 = Yi * tileRowOffset / 2 - Xi * tileRowOffset / 2;

        var offX2 = Xj * tileColumnOffset / 2 + Yj * tileColumnOffset / 2 + tileColumnOffset;
        var offY2 = Yj * tileRowOffset / 2 - Xj * tileRowOffset / 2 + tileRowOffset;

        // move vertical origin
        offY2 = offY2 + ( this.grid.Ytiles / 2 * tileRowOffset);
        offY1 = offY1 + ( this.grid.Ytiles / 2 * tileRowOffset);

        console.log("tileOffsets" + tileColumnOffset + "/" + tileRowOffset);
        console.log("offX" + offX1 + "," +offY1 + " to " + offX2 + "," + offY2);
        console.log("with canvas " + this.canvasRef.nativeElement.offsetWidth);
        

        // now adjust the transform parameters
        this.zoomFactor =  this.canvasRef.nativeElement.offsetWidth / (offX2 - offX1);
        // avoid overzooming 
        this.zoomFactor = Math.min(this.zoomFactor, 4); 
        console.log("and zoom factor " + this.zoomFactor);

        this.translateX = -(Math.min(offX1,offX2)  * this.zoomFactor);
        this.translateY = -(Math.min(offY1,offY2) * this.zoomFactor);
        this.zoomIdentity = this.d3.zoomIdentity.translate(this.translateX,this.translateY).scale(this.zoomFactor);
        // programmatically call zoom
        this.d3.select("canvas").transition().duration(750).call(this.zoom.transform, this.d3.zoomIdentity.translate(this.translateX,this.translateY).scale(this.zoomFactor));

      }

      // draw isometric text
      drawText(str,xpos,ypos, size) {
        
        var angle = -0.72;
        
        this.context.save();
        
        // 30 Grad Drehung
        this.context.translate(xpos,ypos);
        this.context.rotate(27 * (Math.PI / 180));
        // perspektivische Verzerrung
        this.context.transform(1, 0, angle, 1, 0, 0);
        // Text zentriert zur Koordinate
        if (size) {
          this.context.font = size + "px Verdana";
        } else{
          this.context.font = "26px Verdana";
        }
        
        this.context.fillStyle = "black";
        this.context.textAlign = 'center';
        this.context.fillText(str, 0, 0);
        
        this.context.restore();
        //this.context.resetTransform();
      }
      
      drawLine(x1:any, y1:any, x2:any, y2:any, color) {
        color = typeof color !== 'undefined' ? color : 'white';
        this.context.strokeStyle = color;
        this.context.beginPath();
        this.context.lineWidth = 1;
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
      }
      
      drawImage(x:number, y:number, imgName: string) {
        
        if (imgName.indexOf(",") > -1) {
          // stacked complex images
          imgName.split(",").forEach(imgName => {
            this.drawImage(x,y,imgName);
          })
        } else {
          // simple single image
          var drawing = new Image() 
          drawing.src = "assets/tiles/" + imgName + ".svg";
          this.context.drawImage(drawing, x ,y - this.grid.tileRowOffset * 0.6, 
            this.grid.tileColumnOffset, this.grid.tileRowOffset * 1.6);
          }
        }
        
      }
      