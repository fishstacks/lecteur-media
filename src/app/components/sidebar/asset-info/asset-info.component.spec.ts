import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetInfoComponent } from './asset-info.component';

describe('AssetInfoComponent', () => {
  let component: AssetInfoComponent;
  let fixture: ComponentFixture<AssetInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AssetInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
