import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThumbnailBarComponent } from './thumbnail-bar.component';

describe('ThumbnailBarComponent', () => {
  let component: ThumbnailBarComponent;
  let fixture: ComponentFixture<ThumbnailBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThumbnailBarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThumbnailBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
