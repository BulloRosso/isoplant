import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { TileData } from './model/tile-data';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TiledCoreService {

  public zoomLevel : number = 4;
  public selectedTile : string = null;
  
  private _bulletData : BehaviorSubject<any> = new BehaviorSubject({});
  private _tileData :  BehaviorSubject<Map<string,TileData>> = new BehaviorSubject(new Map<string,TileData>());
  
  constructor(private http: HttpClient) {

      // left here only for demonstration purposes of the internal structure (!)
      // a JSON representation is under /assets/sample-data/tilemap.json
      //
      // #region demodata 
      if (false) {
      // Let's create some test data
      //
      var testDataArr = [
        { coordinate: "1,1", imgName: "machine", labelText: "L100-1", mapKpis: {
          "andon": "gold",
          "oee": "5"
        }, mapSelectionPath: { "Line": "L1", "Workcenter":"L100", "Machine":"L100-1"} },
        { coordinate: "3,1", imgName: "warehouse", labelText: "WAREHOUSE" },
        { coordinate: "5,1", imgName: "conveyor", labelText: "U7120", mapKpis: {
          "andon": "red",
          "oee": "1"
        } },
        { coordinate: "0,1", mapSelectionPath: { "Line": "L1","Workcenter":"L200", "Machine": "L200-1" } },
        { coordinate: "0,2", mapSelectionPath: { "Line": "L1", "Workcenter":"L200", "Machine": "L200-2" } },
        { coordinate: "0,0", imgName: "wall_left", labelText: null },
        { coordinate: "1,0", imgName: "wall_left,road_right", labelText: null },
        { coordinate: "2,0", imgName: "wall_left,road_crossroad_e_s_w,paletts,door_north_south", labelText: null },
        { coordinate: "3,0", imgName: "wall_left,road_right", labelText: null },
        { coordinate: "4,0", imgName: "wall_left,road_right", labelText: null },
        { coordinate: "5,0", imgName: "wall_left,road_right", labelText: null },
        { coordinate: "6,0", imgName: "wall_left,road_crossroad_e_s_w", labelText: null },
        { coordinate: "7,0", imgName: "wall_left,road_right,agv_west", labelText: null },
        { coordinate: "8,0", imgName: "wall_left,road_right,door_north_south", labelText: null },
        { coordinate: "9,0", imgName: "wall_left", labelText: null },
        { coordinate: "7,1", imgName: "paletts_big", labelText: "FINISHED GOODS" },
        { coordinate: "8,1", imgName: "paletts_big", labelText: null },
        { coordinate: "7,2", imgName: "paletts_big", labelText: null },
        { coordinate: "8,2", imgName: "paletts", labelText: null },
        { coordinate: "2,1", imgName: "road_left", labelText: null },
        { coordinate: "2,2", imgName: "road_left", labelText: null },
        { coordinate: "1,2", imgName: "machine", statusColor: "red", labelText: "L100-3",
          mapSelectionPath: { "Line": "L1", "Workcenter":"L100", "Machine": "L100-3"},
          mapKpis: {
            "andon": "green",
            "oee": "0"
          }
        },
        { coordinate: "0,9", backgroundColor: "white"},
        { coordinate: "0,8", backgroundColor: "white"},
        { coordinate: "0,7", backgroundColor: "white"},
        { coordinate: "1,9", backgroundColor: "white"},
        { coordinate: "1,8", backgroundColor: "white", labelText: "MILLING AREA"},
        { coordinate: "1,7", backgroundColor: "white"},
      ];

      testDataArr.forEach(itm => {
        const tile: TileData = new TileData();
        tile.coordinate = itm.coordinate;
        tile.imgName = itm.imgName;
        tile.labelText = itm.labelText;
        tile.backgroundColor = itm.backgroundColor;
        tile.statusColor = itm.statusColor;
        if (itm.mapSelectionPath) {
          tile.mapSelectionPath = itm.mapSelectionPath;
        } else {
          tile.mapSelectionPath = null;
        }
        if (itm.mapKpis) {
          tile.mapKpis = itm.mapKpis;
        } else {
          tile.mapKpis = null;
        }
        this._tileData.value.set(itm.coordinate, tile);
      });

    }
    //#endregion
  }

  public saveData(url: string) {

     console.log(JSON.stringify(Array.from(this._tileData.value.entries()))); 
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

  public shiftGrid(direction:string) {

    let newMap = new Map<string, TileData>();
    
    switch (direction) {
      case "north":
        
        this._tileData.value.forEach((key ) => {
            
          let x = parseInt(key.coordinate.split(',')[0]);
          let y = parseInt(key.coordinate.split(',')[1]);
          let newTileData = key;
          newTileData.coordinate = (x + 1) + "," + y;
          newMap.set((x + 1) + "," + y, newTileData);
            
        });

        break;
      case "south":
        
        this._tileData.value.forEach((key ) => {
            
          let x = parseInt(key.coordinate.split(',')[0]);
          let y = parseInt(key.coordinate.split(',')[1]);
          let newTileData = key;
          newTileData.coordinate = (x - 1) + "," + y;
          newMap.set((x - 1) + "," + y, newTileData);
          
        });

        break;
      case "east":
        
      this._tileData.value.forEach((key ) => {
            
        let x = parseInt(key.coordinate.split(',')[0]);
        let y = parseInt(key.coordinate.split(',')[1]);
        let newTileData = key;
        newTileData.coordinate = x + "," + (y + 1);
        newMap.set(x + "," + (y + 1), newTileData);
        
      });

        break;
      case "west":
        
        this._tileData.value.forEach((key ) => {
              
          let x = parseInt(key.coordinate.split(',')[0]);
          let y = parseInt(key.coordinate.split(',')[1]);
          let newTileData = key;
          newTileData.coordinate = x + "," + (y - 1);
          newMap.set(x + "," + (y - 1), newTileData);
          
        });

        break;
      }

      // re-init old map with temp map
      this.clearMap();
      newMap.forEach((key ) => {
         this.setTileData(key.coordinate, key);
      });
  
      this._tileData.next(this._tileData.value);
  }

  private clearMap() {
    this._tileData.value.clear();
  }

  public getTileData(key) {
    if (this._tileData.value.has(key)) {
      return this._tileData.value.get(key);
    } else {
      return null;
    }
  }

  // init from url (JSON)
  public loadData(url: string) {

    return this.http.get(url).subscribe((data: Map<string,TileData>) => {
        console.log("Loaded data from " + url);
        // loaded data
        this.clearMap();
        data.forEach((val,key) => {
          this.setTileData(val[0],val[1]);
        });
        // triger redraw
        this._tileData.next(this._tileData.value);
    });;
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
