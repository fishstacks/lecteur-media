import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasPlayerComponent } from './canvas-player.component';

describe('CanvasPlayerComponent', () => {
  let component: CanvasPlayerComponent;
  let fixture: ComponentFixture<CanvasPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasPlayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
