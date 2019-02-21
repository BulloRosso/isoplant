import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { TileData } from './model/tile-data';

@Injectable({
  providedIn: 'root'
})
export class TiledCoreService  {

  public zoomLevel : number = 1;
  public selectedTile : string = null;
  
  private _bulletData : BehaviorSubject<any> = new BehaviorSubject({});
  private _tileData :  BehaviorSubject<Map<string,TileData>> = new BehaviorSubject(new Map<string,TileData>());
  
  constructor() {

      // Let's create some test data
      //
      var testDataArr = [
        { coordinate: "1,1", imgName: "machine", labelText: "U7110", mapKpis: new Map([
          ["andon", "19"],
          ["oee", "5"]
        ]) },
        { coordinate: "3,1", imgName: "warehouse", labelText: "WAREHOUSE" },
        { coordinate: "5,1", imgName: "conveyor", labelText: "U7120", mapKpis: new Map([
          ["andon", "8"],
          ["oee", "1"]
        ]) },
        { coordinate: "0,0", imgName: "wall_left", labelText: null },
        { coordinate: "1,0", imgName: "wall_left,road_right", labelText: null },
        { coordinate: "2,0", imgName: "wall_left,road_right,paletts", labelText: null },
        { coordinate: "3,0", imgName: "wall_left", labelText: null },
        { coordinate: "4,0", imgName: "wall_left", labelText: null },
        { coordinate: "5,0", imgName: "wall_left", labelText: null },
        { coordinate: "6,0", imgName: "wall_left", labelText: null },
        { coordinate: "7,0", imgName: "wall_left", labelText: null },
        { coordinate: "8,0", imgName: "wall_left", labelText: null },
        { coordinate: "9,0", imgName: "wall_left", labelText: null },
        { coordinate: "7,1", imgName: "paletts", labelText: "FINISHED GOODS" },
        { coordinate: "8,1", imgName: "paletts", labelText: null },
        { coordinate: "7,2", imgName: "paletts", labelText: null },
        { coordinate: "8,2", imgName: "paletts", labelText: null },
      ];

      testDataArr.forEach(itm => {
        const tile: TileData = new TileData();
        tile.coordinate = itm.coordinate;
        tile.imgName = itm.imgName;
        tile.labelText = itm.labelText;
        if (itm.mapKpis) {
          tile.mapKpis = itm.mapKpis;
        } else {
          tile.mapKpis = null;
        }
        this._tileData.value.set(itm.coordinate, tile);
      });
    
  }

  public tileData(): Observable<any> {
      return this._tileData.asObservable();
  }

  public bulletData() : Observable<any> {
      return this._bulletData.asObservable();
  }

  public setBulletData(dt) {
     this._bulletData.next(dt);
  }

  public allTileData() {
    return this._tileData.value;
  }

  public broadcastRefresh() {
    this._tileData.next(this._tileData.value);
  }

  public getTileData(key) {
    if (this._tileData.value.has(key)) {
      return this._tileData.value.get(key);
    } else {
      return null;
    }
  }

  public setTileData(key : string, val : TileData) {
     this._tileData.value.set(key, val);
     this._tileData.next(this._tileData.value);
  }

  public clearTileData(key : string) {
    this._tileData.value.delete(key);
    this._tileData.next(this._tileData.value);
 }

  

  public incrementZoom() {
     this.zoomLevel++;
  }

  public decrementZoom() {
    this.zoomLevel--;
  }

 
}
