import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TiledCoreService {

  public zoomLevel : number = 1;
  public selectedTile : string = null;
  
  private _bulletData : BehaviorSubject<any> = new BehaviorSubject({});
  private _tileData :  BehaviorSubject<Map<string,string>> = new BehaviorSubject(new Map<string,string>());
  
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

  public setTileData(key : string, val : string) {
     this._tileData.value.set(key, val);
     this._tileData.next(this._tileData.value);
  }

  public clearTileData(key : string) {
    this._tileData.value.delete(key);
    this._tileData.next(this._tileData.value);
 }

  constructor() { }

  public incrementZoom() {
     this.zoomLevel++;
  }

  public decrementZoom() {
    this.zoomLevel--;
  }

 
}
