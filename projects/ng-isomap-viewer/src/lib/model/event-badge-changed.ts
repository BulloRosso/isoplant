export interface Event {
  eventName: 'tileEditCompleted' | 'kpiChanged' | 'cellSelected' | 'mapLoaded' | 'resetMap' | 'selectedBadgeType';
}

export interface EventBadgeChanged extends Event {
  eventType: string;
  eventTarget: string;
  eventValue: string;
}

export interface EventTileEditCompleted extends Event {
}

export interface EventBadgeSelected extends Event {
  value: string;
}

export interface EventCellSelected extends Event {
  cellIndex: string;
}
