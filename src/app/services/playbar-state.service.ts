import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlaybarStateService {

  constructor() { }

  private isPlaybarDisabledSubject = new BehaviorSubject<boolean>(false);
  isPlaybarDisabled$ = this.isPlaybarDisabledSubject.asObservable();

  disablePlaybar() {
    this.isPlaybarDisabledSubject.next(true);
  }

  enablePlaybar() {
    this.isPlaybarDisabledSubject.next(false);
  }
}
