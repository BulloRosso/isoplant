import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TiledCanvasComponent } from './tiled-canvas.component';

describe('TiledCanvasComponent', () => {
  let component: TiledCanvasComponent;
  let fixture: ComponentFixture<TiledCanvasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TiledCanvasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TiledCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
