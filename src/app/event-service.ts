import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

// Super simple event service (just for demonstration purposes)
//
@Injectable()
export class EventService<T> {
    protected _eventSubject = new Subject();

    public events = this._eventSubject.asObservable();

    dispatchEvent(event) {
       this._eventSubject.next(event);
    }
}