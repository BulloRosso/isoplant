import { Component, OnInit, OnDestroy } from '@angular/core';
import { TiledCoreService } from '../tiled-core.service';

@Component({
  selector: 'tiled-canvas',
  templateUrl: './tiled-canvas.component.html',
  styleUrls: ['./tiled-canvas.component.css']
})
// 
//   Simple Isometric Renderer inspired by http://nick-aschenbach.github.io/assets/2015-02-25-isometric-tile-engine/isometric02/js/isometric.js
//
export class TiledCanvasComponent implements OnInit, OnDestroy {
  
  private grid = {
    Xtiles: 10,
    Ytiles: 10,
    tileColumnOffset: 80, // pixels
    tileRowOffset: 40,    // pixels
    selectedTileX: -1,
    selectedTileY: -1,
    showCoordinates: false,
    originY: 0,
    originX: 0,
    bulletColor: null,
    tileMap: new Map<string,string>() 
 };

 event: MouseEvent;

 private canvas; 
 private context; 
 private tileSubscription;
 private bulletSubscription;

 constructor(private tiledCoreService : TiledCoreService) { 

    this.tileSubscription = this.tiledCoreService.tileData().subscribe(retMap => { 
      if (document.getElementById("tileCanvas")) {
        console.log("REDRAW tiles");
        this.grid.tileMap = retMap;
        this.redrawTiles(this.grid.tileMap);
      }
    });

    this.bulletSubscription = this.tiledCoreService.bulletData().subscribe(retBullets => {
      
       if (document.getElementById("tileCanvas")) {
          this.grid.bulletColor = retBullets["color"];
          console.log("BULLET redraw " + retBullets["color"]);
          this.redrawTiles(this.grid.tileMap);
       }
    })
 }

 ngOnInit() {

   this.redrawTiles( this.tiledCoreService.allTileData());

 }

 ngOnDestroy() {
   this.tileSubscription.unsubscribe();
   this.bulletSubscription.unsubscribe();
 }

 onEvent(event: MouseEvent): void {

   var pageX = event.pageX - this.grid.tileColumnOffset / 2 - this.grid.originX;
   var pageY = event.pageY - this.grid.tileRowOffset / 2 - this.grid.originY;

   var tileX = Math.round(pageX / this.grid.tileColumnOffset - pageY / this.grid.tileRowOffset);
   var tileY = Math.round(pageX / this.grid.tileColumnOffset + pageY / this.grid.tileRowOffset);

   this.grid.selectedTileX = tileX;
   this.grid.selectedTileY = tileY;

   // über Funktion im Core-Service setzen (nicht wie hier direkt)
   this.tiledCoreService.selectedTile = tileX + "," + tileY;

   // hier nur als Beispiel, setzt eigenlich der Editor
   this.tiledCoreService.setTileData(this.tiledCoreService.selectedTile, "cube-outline");

   //this.redrawTiles();
 }

 redrawTiles(tileData: Map<string,string>) {

   this.canvas = <HTMLCanvasElement>document.getElementById("tileCanvas");
   this.context =  this.canvas.getContext("2d");

   var width = 800;
   var height = 400;

   this.context.canvas.width  = width;
   this.context.canvas.height = height;

   this.grid.originX = width / 2 - this.grid.Xtiles * this.grid.tileColumnOffset / 2;
   this.grid.originY = height / 2;

   for(var Xi = (this.grid.Xtiles - 1); Xi >= 0; Xi--) {
     for(var Yi = 0; Yi < this.grid.Ytiles; Yi++) {
       this.drawTile(Xi, Yi, tileData.get(Xi + "," + Yi));
     }
   }

   // TEST
   this.drawText("ISOMETRIC PLANT VIEW",560,-90);

 }

 drawTile(Xi, Yi, tileData) {


   var offX = Xi * this.grid.tileColumnOffset / 2 + Yi * this.grid.tileColumnOffset / 2 + this.grid.originX;
   var offY = Yi * this.grid.tileRowOffset / 2 - Xi * this.grid.tileRowOffset / 2 + this.grid.originY;

   // Draw tile interior
   if( Xi == this.grid.selectedTileX && Yi == this.grid.selectedTileY)
     this.context.fillStyle = 'yellow';
   else
     this.context.fillStyle = '#ccc';
   
   this.context.beginPath();
   this.context.moveTo(offX, offY + this.grid.tileRowOffset / 2);
   this.context.lineTo(offX + this.grid.tileColumnOffset / 2, offY);
   this.context.lineTo( offX + this.grid.tileColumnOffset, offY + this.grid.tileRowOffset / 2);
   this.context.lineTo(offX + this.grid.tileColumnOffset, offY + this.grid.tileRowOffset / 2);
   this.context.lineTo(offX + this.grid.tileColumnOffset / 2, offY + this.grid.tileRowOffset);
   this.context.lineTo(offX + this.grid.tileColumnOffset / 2, offY + this.grid.tileRowOffset);
   this.context.lineTo(offX, offY + this.grid.tileRowOffset / 2);
   this.context.stroke();
   this.context.fill();
   this.context.closePath();

   // Draw tile outline
   var color = '#999';
   this.drawLine(offX, offY + this.grid.tileRowOffset / 2, offX + this.grid.tileColumnOffset / 2, offY, color);
   this.drawLine(offX + this.grid.tileColumnOffset / 2, offY, offX + this.grid.tileColumnOffset, offY + this.grid.tileRowOffset / 2, color);
   this.drawLine(offX + this.grid.tileColumnOffset, offY + this.grid.tileRowOffset / 2, offX + this.grid.tileColumnOffset / 2, offY + this.grid.tileRowOffset, color);
   this.drawLine(offX + this.grid.tileColumnOffset / 2, offY + this.grid.tileRowOffset, offX, offY + this.grid.tileRowOffset / 2, color);

   if(this.grid.showCoordinates) {
     this.context.fillStyle = 'orange';
     this.context.fillText(Xi + ", " + Yi, offX + this.grid.tileColumnOffset/2 - 9, offY + this.grid.tileRowOffset/2 + 3);
   }

   if (tileData) {
      var imgSrc = tileData; // normalerweise wäre tileData ein großes JSON-Objekt, das die Eigenschaften beschreibt
      this.drawImage(offX, offY, imgSrc);

      if (this.grid.bulletColor) {
    
        this.context.fillStyle = this.grid.bulletColor;
        this.context.beginPath();
        this.context.arc(offX +60, offY + 10, 8, 0, 2 * Math.PI, true);
        this.context.closePath(); 
        this.context.fill();
       }
   }

 }

 // draw isometric text
 drawText(str,xpos,ypos) {
    
    var angle = -0.72;

    this.context.save();

    // 30 Grad Drehung
    this.context.translate(0,-100);
    this.context.rotate(27 * (Math.PI / 180));
    // perspektivische Verzerrung
    this.context.transform(1, 0, angle, 1, 0, 0);
    // Text zentriert zur Koordinate
    this.context.font = "26px Verdana";
    this.context.fillStyle = "black";
    this.context.textAlign = 'center';
    this.context.fillText(str, xpos, ypos);
    
    this.context.restore();
    this.context.resetTransform();
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
   var drawing = new Image() 
   drawing.src = "assets/" + imgName + ".svg"; 
   this.context.drawImage(drawing,x +28,y +8);
 }

}
