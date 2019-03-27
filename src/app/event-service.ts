import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { Event } from './model/event-badge-changed';

// Super simple event service (just for demonstration purposes)
//
@Injectable()
export class EventService {
    protected _eventSubject = new Subject();

    public events = this._eventSubject.asObservable();

    dispatchEvent(event) {
       this._eventSubject.next(event);
    }
}