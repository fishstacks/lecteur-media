import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { formatTime } from '../../../util/funcs';

@Component({
  selector: 'app-play-bar',
  templateUrl: './play-bar.component.html',
  imports: [CommonModule],
  styleUrls: ['./play-bar.component.scss']
})
export class PlayBarComponent {
  @Input() progress = 0;
  @Input() currentTime = 0;
  @Input() assetDuration = 0;
  @Input() isPlaying = false;
  @Input() isPlaybarDisabled = false;
  @Output() play = new EventEmitter<void>();
  @Output() pause = new EventEmitter<void>();
  @Output() seek = new EventEmitter<number>();

  formatTimeFunc = formatTime;

  onPlay(): void {
    this.play.emit();
  }

  onPause(): void {
    this.pause.emit();
  }

  onSeek(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const progressValue = parseFloat(inputElement.value);
    if (!isNaN(progressValue)) {
      this.seek.emit(progressValue);
    }
  }
}