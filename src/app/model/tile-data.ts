export class TileData {

    public coordinate : string; // e. g. "0,0"

    public mapKpis  = new Object(); // Hashmap key/val

    public backgroundColor: string;

    public labelText: string;

    public imgName: string;

    public statusColor: string; // e. g. red

    // drilldown assignment (depending on current drilldown object selector)
    public mapSelectionPath  = new Object(); // Hashmap key/val

}