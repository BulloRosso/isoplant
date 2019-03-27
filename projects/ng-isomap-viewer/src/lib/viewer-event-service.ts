import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

// Super simple event service (just for demonstration purposes)
//
@Injectable({
    providedIn: 'root'
})
export class ViewerEventService {
    protected eventSubject = new Subject();

    public events = this.eventSubject.asObservable();

    dispatchEvent(event) {
       this.eventSubject.next(event);
    }
}