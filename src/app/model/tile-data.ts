export class TileData {

    public coordinate : string; // e. g. "0,0"

    public mapKpis : Map<string, string> = new Map<string,string>();

    public backgroundColor: string;

    public labelText: string;

    public imgName: string;

    // drilldown assignment (depending on current drilldown object selector)
    public level1Id: string; // line
    public level2Id: string; // workcenter
    public level3Id: string; // machine

}