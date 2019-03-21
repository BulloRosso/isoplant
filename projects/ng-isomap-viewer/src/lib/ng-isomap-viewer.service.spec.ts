import { TestBed } from '@angular/core/testing';

import { NgIsomapViewerService } from './ng-isomap-viewer.service';

describe('NgIsomapViewerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgIsomapViewerService = TestBed.get(NgIsomapViewerService);
    expect(service).toBeTruthy();
  });
});
