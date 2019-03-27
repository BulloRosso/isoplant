export interface TileData {
  coordinate: string; // e. g. "0,0"
  mapKpis: { [key: string]: string }; // Hashmap key/val
  backgroundColor: string;
  labelText: string;
  imgName: string;
  statusColor: string; // e. g. red
  // drilldown assignment (depending on current drilldown object selector)
  mapSelectionPath: { [key: string]: string }; // Hashmap key/val
}
