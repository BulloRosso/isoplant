import { TestBed } from '@angular/core/testing';

import { TiledCoreService } from './tiled-core.service';

describe('TiledCoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TiledCoreService = TestBed.get(TiledCoreService);
    expect(service).toBeTruthy();
  });
});
