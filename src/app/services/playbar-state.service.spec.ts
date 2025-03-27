import { TestBed } from '@angular/core/testing';

import { PlaybarStateService } from './playbar-state.service';

describe('PlaybarStateService', () => {
  let service: PlaybarStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaybarStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
