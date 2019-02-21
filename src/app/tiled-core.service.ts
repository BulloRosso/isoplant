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
      const m1: TileData = new TileData();
      m1.coordinate = "1,0";
      m1.imgName = "machine";
      this._tileData.value.set("0,0", m1);

      const m2: TileData = new TileData();
      m2.coordinate = "2,0";
      m2.imgName = "warehouse";
      m2.labelText = "U7110";
      this._tileData.value.set("2,0", m2);

      const m3: TileData = new TileData();
      m3.coordinate = "4,0";
      m3.imgName = "conveyor";
      this._tileData.value.set("4,0", m3);

    
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
