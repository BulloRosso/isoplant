import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ViewerEventService } from './viewer-event-service';
import { TileData } from './model/tile-data';

@Injectable({
  providedIn: 'root'
})
export class ViewerTiledCoreService {
  public zoomLevel = 1;
  public selectedTile = '';

  private bulletDataSubject = new BehaviorSubject({});
  private tileDataSubject = new BehaviorSubject<{ [key: string]: TileData }>(
    {}
  );

  constructor(
    private http: HttpClient,
    private eventService: ViewerEventService
  ) {}

  public saveData(url: string) {
    console.log(
      JSON.stringify(Array.from(Object.values(this.tileDataSubject.value)))
    );
  }

  public tileData(): Observable<any> {
    return this.tileDataSubject.asObservable();
  }

  public bulletData(): Observable<any> {
    return this.bulletDataSubject.asObservable();
  }

  public setBulletData(dt) {
    this.bulletDataSubject.next(dt);
  }

  public allTileData() {
    return this.tileDataSubject.value;
  }

  public broadcastRefresh() {
    this.tileDataSubject.next(this.tileDataSubject.value);
  }

  public shiftGrid(direction: string) {
    const newMap = {};

    switch (direction) {
      case 'north':
        (Object.values(this.tileDataSubject.value) || []).forEach(key => {
          const x = parseInt(key.coordinate.split(',')[0], 10);
          const y = parseInt(key.coordinate.split(',')[1], 10);
          const newTileData = key;
          newTileData.coordinate = x + 1 + ',' + y;
          newMap[x + 1 + ',' + y] = newTileData;
        });

        break;
      case 'south':
        (Object.values(this.tileDataSubject.value) || []).forEach(key => {
          const x = parseInt(key.coordinate.split(',')[0], 10);
          const y = parseInt(key.coordinate.split(',')[1], 10);
          const newTileData = key;
          newTileData.coordinate = x - 1 + ',' + y;
          newMap[x - 1 + ',' + y] = newTileData;
        });

        break;
      case 'east':
        (Object.values(this.tileDataSubject.value) || []).forEach(key => {
          const x = parseInt(key.coordinate.split(',')[0], 10);
          const y = parseInt(key.coordinate.split(',')[1], 10);
          const newTileData = key;
          newTileData.coordinate = x + ',' + (y + 1);
          newMap[x + ',' + (y + 1)] = newTileData;
        });

        break;
      case 'west':
        (Object.values(this.tileDataSubject.value) || []).forEach(key => {
          const x = parseInt(key.coordinate.split(',')[0], 10);
          const y = parseInt(key.coordinate.split(',')[1], 10);
          const newTileData = key;
          newTileData.coordinate = x + ',' + (y - 1);
          newMap[x + ',' + (y - 1)] = newTileData;
        });

        break;
    }

    // re-init old map with temp map
    this.clearMap();
    (Object.keys(newMap) || []).forEach(key => {
      this.setTileData(key, newMap[key]);
    });

    this.tileDataSubject.next(this.tileDataSubject.value);
  }

  private clearMap() {
    this.tileDataSubject.next({});
  }

  public getTileData(key) {
    if (this.tileDataSubject.value[key]) {
      return this.tileDataSubject.value[key];
    } else {
      return null;
    }
  }

  // init from url (JSON)
  public loadData(url: string) {
    return this.http.get(url).subscribe((data: {[key: string]: TileData}) => {
      console.log('Loaded data from ' + url);
      // loaded data
      this.clearMap();
      (Object.values(data) || []).forEach((val) => {
        this.setTileData(val[0], val[1]);
      });
      // triger redraw
      this.eventService.dispatchEvent({ eventName: 'mapLoaded' });
    });
  }

  public setTileData(key: string, val: TileData) {
    this.tileDataSubject.value[key] = val;
    this.tileDataSubject.next(this.tileDataSubject.value);
  }

  public clearTileData(key: string) {
    this.tileDataSubject.value[key] = undefined;
    this.tileDataSubject.next(this.tileDataSubject.value);
  }

  public incrementZoom() {
    this.zoomLevel++;
  }

  public decrementZoom() {
    this.zoomLevel--;
  }
}
