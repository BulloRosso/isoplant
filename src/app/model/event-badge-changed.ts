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