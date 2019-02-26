import { Component, OnInit, OnDestroy, ElementRef, Renderer, ViewChild, Renderer2, AfterViewInit, ViewChildren, ContentChild } from '@angular/core';
import { TiledCoreService } from '../tiled-core.service';
import { TileData } from '../model/tile-data';
import { PanZoomConfig, PanZoomAPI, PanZoomModel } from 'ng2-panzoom';
import { Subscription, Subject } from 'rxjs';
import { Observable, BehaviorSubject } from 'rxjs';
import { IsoMapItem } from '../model/iso-map-item';

@Component({
  selector: 'tiled-canvas',
  templateUrl: './tiled-canvas.component.html',
  styleUrls: ['./tiled-canvas.component.css']
})
// 
//   Simple Isometric Renderer inspired by http://nick-aschenbach.github.io/assets/2015-02-25-isometric-tile-engine/isometric02/js/isometric.js
//
export class TiledCanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  
  private grid = {
    Xtiles: 10,
    Ytiles: 10,
    
    tileColumnOffset: 80, // pixels
    tileRowOffset: 40,    // pixels
    
    selectedTileX: -1,
    selectedTileY: -1,
    
    showCoordinates: false, // only to learn how axis values are set
    showOutlines: false, // show borders - helps to align svs and debug
    
    originY: 0,
    originX: 0,
    
    style: {
      tileColor: "#ccc"
    },
    
    bulletColor: null,
    tileMap: new Map<string,TileData>() 
  };
  
  private panZoomConfig: PanZoomConfig = new PanZoomConfig();
  private panZoomAPI: PanZoomAPI;
  private modelChangedSubscription: Subscription;
  private apiSubscription: Subscription;
  
  event: MouseEvent;
  @ViewChild('tileCanvas') canvasRef:ElementRef;
  @ViewChild('tileViewport') viewportRef:ElementRef;
  private canvas; 
  private context; 
  private tileSubscription;
  private bulletSubscription;
  
  // stuff for moving the canvas inside the outer div (viewport)
  private lastX = 0;
  private lastY = 0;
  private currentPanZoomFactor = 0;
  
  public selectUnitType: string = "Line";
  public unitTypes = [ "Line", "Workcenter", "Machine", "Cell" ];
  
  public selectArea: string = "Plant";
  public areaTypes = [ "Plant", "Milling area", "Drilling area", "Spilling area" ];
  
  // make observable (THIS IS FOR THE HOST PAGE)
  private _selectedItem = new Subject<IsoMapItem>();
  public selectedItem: Observable<IsoMapItem> = this._selectedItem.asObservable();
  
  // make observable (THIS IS FOR THE EDITOR COMPONENT)
  private _selectedCell = new Subject<TileData>();
  public selectedCell: Observable<TileData> = this._selectedCell.asObservable();
  
  // internal state
  private selectedObjectName = "";
  private selectedObjectType = "";
  
  constructor(private tiledCoreService : TiledCoreService, private elementRef: ElementRef, private renderer: Renderer2) { 
    
    // panzoom konfigurieren https://www.npmjs.com/package/jquery.panzoom#disable
    //
    //this.panZoomConfig.zoomOnMouseWheel = true;
    //this.panZoomConfig.keepInBounds = true;
    //this.panZoomConfig.zoomToFitZoomLevelFactor = 1;
    //this.panZoomConfig.neutralZoomLevel = 4;
    this.panZoomConfig.zoomOnDoubleClick = false;
    this.panZoomConfig.initialZoomLevel = 0;
    
    this.tileSubscription = this.tiledCoreService.tileData().subscribe(retMap => { 
      if (this.canvasRef) {
        console.log("REDRAW tiles");
        this.redrawTiles(this.tiledCoreService.allTileData());
      }
    });
    
    this.bulletSubscription = this.tiledCoreService.bulletData().subscribe(retBullets => {
      
      if (this.canvasRef) {
        this.grid.bulletColor = retBullets["color"];
        console.log("BULLET redraw " + retBullets["color"]);
        this.redrawTiles(this.tiledCoreService.allTileData());
      }
    });
    
  }
  
  imagesReady() {
    // preloading finished by browser
    this.redrawTiles(this.tiledCoreService.allTileData());
  }
  
  
  ngAfterViewInit() {
    
  }
  
  ngOnInit() {
    
    this.redrawTiles( this.tiledCoreService.allTileData());
    
    this.apiSubscription = this.panZoomConfig.api.subscribe( (api: PanZoomAPI) => this.panZoomAPI = api );
    this.modelChangedSubscription = this.panZoomConfig.modelChanged.subscribe( (model: PanZoomModel) => this.onModelChanged(model) );
  }
  
  ngOnDestroy() {
    this.tileSubscription.unsubscribe();
    this.bulletSubscription.unsubscribe();
    this.apiSubscription.unsubscribe();  // don't forget to unsubscribe.  you don't want a memory leak!
    this.modelChangedSubscription.unsubscribe();  // don't forget to unsubscribe.  you don't want a memory leak!
  }
  
  // receive live data from panZoom plugin
  //
  onModelChanged(model: PanZoomModel): void {
    // console.log(model.zoomLevel);
    this.currentPanZoomFactor = model.zoomLevel; // 2 = 100%
    this.lastX = model.pan.x;
    this.lastY = model.pan.y;
  }

  // select a tile AND an object according toe the header preferences
  //
  onClick(event: MouseEvent): void {
    
    const clickXforCanvas = event.clientX - 10; // TODO determine canvas offset
    const clickYforCanvas = event.clientY - 70; // TODO determine canvas offset

    const clickXScaled = (clickXforCanvas - this.lastX) / Math.pow(2, this.currentPanZoomFactor);
    const clickYScaled = (clickYforCanvas - this.lastY) / Math.pow(2, this.currentPanZoomFactor);

    // canvas size
    this.grid.originX = 800 / 2 - this.grid.Xtiles * this.grid.tileColumnOffset / 2; // TODO determine canvas size
    this.grid.originY = 400 / 2;                                                     // TODO determine canvase size

    // position of mouse-pointer: click-location 
    var pageX = clickXScaled - this.grid.tileColumnOffset / 2 - this.grid.originX;
    var pageY = clickYScaled - this.grid.tileRowOffset / 2 - this.grid.originY;
    
    // tile index
    var tileX = Math.round(pageX / this.grid.tileColumnOffset - pageY / this.grid.tileRowOffset);
    var tileY = Math.round(pageX / this.grid.tileColumnOffset + pageY / this.grid.tileRowOffset);
    
    console.log(tileX + ".." + tileY);
    
    if (tileX < 0 || tileY < 0) {
      return; 
    }
    
    this.grid.selectedTileX = tileX;
    this.grid.selectedTileY = tileY;
    
    var newTile;
    
    if (!this.tiledCoreService.getTileData(tileX + "," + tileY)) {
      newTile = new TileData();
      newTile.coordinate = tileX + "," + tileY;
      this.tiledCoreService.setTileData(tileX + "," + tileY, newTile);
    } else {
      newTile = this.tiledCoreService.getTileData(tileX + "," + tileY);
    }
    
    this._selectedCell.next(newTile); // signal to editor (if present)
    
    this.tiledCoreService.selectedTile = tileX + "," + tileY;
    
    let selTileData =  this.tiledCoreService.getTileData(this.tiledCoreService.selectedTile);
    
    // Default: the cell that was hit
    //
    this.selectedObjectName = "[" + tileX + "," + tileY + "]";
    
    if (selTileData.mapSelectionPath && this.selectUnitType != "Cell") {
      // look for object type to select
      let hit = selTileData.mapSelectionPath.get(this.selectUnitType);
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
    }
    
    
    
    
    this.redrawTiles(this.tiledCoreService.allTileData());
  }
  
  redrawTiles(tileData: Map<string, TileData>) {
    
    if (!this.canvasRef) {
      return;
    }
    
    this.canvas = this.canvasRef.nativeElement;
    this.context =  this.canvas.getContext("2d");
    
    this.context.save();
    
    var width = 80 * this.grid.Xtiles * this.tiledCoreService.zoomLevel;
    var height = 40 * this.grid.Ytiles * this.tiledCoreService.zoomLevel;
    
    this.context.canvas.width  = width;
    this.canvas.style.width = width + "px";
    this.context.canvas.height = height;
    this.canvas.style.height = height + "px";
    
    this.grid.tileColumnOffset = 80 * this.tiledCoreService.zoomLevel;
    this.grid.tileRowOffset = 40 * this.tiledCoreService.zoomLevel;
    
    this.grid.originX = width / 2 - this.grid.Xtiles * this.grid.tileColumnOffset / 2 + 1;
    this.grid.originY = height / 2 - this.grid.tileRowOffset / 2 + 1;
    
    // first pass: Images
    for(var Xi = (this.grid.Xtiles - 1); Xi >= 0; Xi--) {
      for(var Yi = 0; Yi < this.grid.Ytiles; Yi++) {
        this.drawTile(Xi, Yi, tileData.get(Xi + "," + Yi));
      }
    }
    
    // second pass: text & bullets
    for(var Xi = (this.grid.Xtiles - 1); Xi >= 0; Xi--) {
      for(var Yi = 0; Yi < this.grid.Ytiles; Yi++) {
        this.drawTileText(Xi, Yi, tileData.get(Xi + "," + Yi));
      }
    }
    
    // TEST
    // this.drawText("ISOMETRIC PLANT VIEW",550,-110);
    
    this.context.restore();
    this.grid.tileColumnOffset = 80 ;
    this.grid.tileRowOffset = 40 ;
    this.grid.originX =0 ;
    this.grid.originY =0;
  }
  
  drawTileText(Xi, Yi, tileData: TileData) {
    
    var offX = Xi * this.grid.tileColumnOffset / 2 + Yi * this.grid.tileColumnOffset / 2 + this.grid.originX;
    var offY = Yi * this.grid.tileRowOffset / 2 - Xi * this.grid.tileRowOffset / 2 + this.grid.originY;
    
    if (tileData) {
      
      if (tileData.labelText && this.tiledCoreService.zoomLevel > 1) {
        this.drawText(tileData.labelText, 
          offX + this.grid.tileColumnOffset / 3.2, 
          offY + this.grid.tileRowOffset / 1.4, 
          6 * this.tiledCoreService.zoomLevel);
        }
        
        if (tileData.imgName) {
          
          if (tileData.statusColor) {
            this.drawImage(offX, offY, tileData.imgName + "_" + tileData.statusColor);
          } else {
            this.drawImage(offX, offY, tileData.imgName);
          }
          
          if (tileData.mapKpis && this.grid.bulletColor) {
            
            const kpiVal = tileData.mapKpis.get("oee");
            
            if (kpiVal) {
              // Circle
              this.context.fillStyle = this.grid.bulletColor;
              this.context.beginPath();
              this.context.arc(offX + 70 * this.tiledCoreService.zoomLevel, offY + 10 * this.tiledCoreService.zoomLevel, 
                8 * this.tiledCoreService.zoomLevel, 0, 2 * Math.PI, true);
                this.context.closePath(); 
                this.context.fill();
                
                // Text
                this.context.font = 8 * this.tiledCoreService.zoomLevel + "px Verdana";
                this.context.fillStyle = "white";
                this.context.textAlign = 'center';
                this.context.fillText(kpiVal, offX + 70 * this.tiledCoreService.zoomLevel, offY + 13 * this.tiledCoreService.zoomLevel);
              }
            }
          }
        }
      }
      
      drawTile(Xi, Yi, tileData: TileData) {
        
        var offX = Xi * this.grid.tileColumnOffset / 2 + Yi * this.grid.tileColumnOffset / 2 + this.grid.originX;
        var offY = Yi * this.grid.tileRowOffset / 2 - Xi * this.grid.tileRowOffset / 2 + this.grid.originY;
        
        // Draw tile interior
        if( Xi == this.grid.selectedTileX && Yi == this.grid.selectedTileY) {
          // selected state
          this.context.fillStyle = 'yellow';
        } else {
          if (tileData && tileData.backgroundColor) {
            // custom background
            this.context.fillStyle = tileData.backgroundColor;
          } else {
            // regular background
            this.context.fillStyle = this.grid.style.tileColor;
          }
        }
        
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
        if(this.grid.showOutlines) {
          color = '#999';
        } 
        this.drawLine(offX, offY + this.grid.tileRowOffset / 2, offX + this.grid.tileColumnOffset / 2, offY, color);
        this.drawLine(offX + this.grid.tileColumnOffset / 2, offY, offX + this.grid.tileColumnOffset, offY + this.grid.tileRowOffset / 2, color);
        this.drawLine(offX + this.grid.tileColumnOffset, offY + this.grid.tileRowOffset / 2, offX + this.grid.tileColumnOffset / 2, offY + this.grid.tileRowOffset, color);
        this.drawLine(offX + this.grid.tileColumnOffset / 2, offY + this.grid.tileRowOffset, offX, offY + this.grid.tileRowOffset / 2, color);
        
        if(this.grid.showCoordinates) {
          this.context.fillStyle = 'orange';
          this.context.fillText(Xi + ", " + Yi, offX + this.grid.tileColumnOffset/2 - 9, offY + this.grid.tileRowOffset/2 + 3);
        }
        
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
      