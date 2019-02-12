import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TiledEditorComponent } from './tiled-editor.component';

describe('TiledEditorComponent', () => {
  let component: TiledEditorComponent;
  let fixture: ComponentFixture<TiledEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TiledEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TiledEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
