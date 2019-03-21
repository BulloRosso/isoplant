export class EventBadgeChanged {

    public eventName = "kpiChanged";

    constructor(eventType: string, eventTarget: string, eventValue:string) {
        this.eventType = eventType;
        this.eventTarget = eventTarget;
        this.eventValue = eventValue;
    }

    public eventType: string;
    public eventTarget: string;
    public eventValue: string;
}

export class EventTileEditCompleted {

    public eventName = "tileEditCompleted";

}

export class EventCellSelected {

    public eventName = "cellSelected";

    constructor(cellIndex: string) {
        this.cellIndex = cellIndex;
    }

    public cellIndex: string;
   
}