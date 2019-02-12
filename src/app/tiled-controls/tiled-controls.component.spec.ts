import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TiledControlsComponent } from './tiled-controls.component';

describe('TiledControlsComponent', () => {
  let component: TiledControlsComponent;
  let fixture: ComponentFixture<TiledControlsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TiledControlsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TiledControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
