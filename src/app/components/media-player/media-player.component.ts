import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaAsset } from '../../models/media-asset';
import { MediaService } from '../../services/media.service';
import { CanvasPlayerComponent } from './canvas-player/canvas-player.component';
import { ThumbnailBarComponent } from './thumbnail-bar/thumbnail-bar.component';
import { PlayBarComponent } from './play-bar/play-bar.component';
import { Subscription } from 'rxjs';
import { PlaybarStateService } from '../../services/playbar-state.service';

@Component({
  selector: 'app-media-player',
  standalone: true,
  imports: [CommonModule, CanvasPlayerComponent, ThumbnailBarComponent, PlayBarComponent],
  templateUrl: './media-player.component.html',
  styleUrl: './media-player.component.scss'
})
export class MediaPlayerComponent implements OnInit, OnDestroy {
  @ViewChild(CanvasPlayerComponent) canvasPlayer!: CanvasPlayerComponent;

  mediaAssets: MediaAsset[] = [];
  isPlaying = false;
  progress = 0;
  currentTime = 0;
  assetDuration = 0;
  currentAssetIndex = 0;
  isPlaybarDisabled: boolean = false;
  private playbarStateSubscription!: Subscription;

  constructor(private mediaService: MediaService, private playbarStateService: PlaybarStateService) {}

  ngOnInit(): void {
    this.mediaService.getMedia().subscribe({
      next: (assets) => {
        console.log('Media assets loaded:', assets);
        this.mediaAssets = assets;
      },
      error: (err) => console.error('Error loading media assets:', err)
    });

    this.playbarStateSubscription = this.playbarStateService.isPlaybarDisabled$.subscribe(
      (state) => {
        this.isPlaybarDisabled = state;
      }
    );
  }

  ngOnDestroy() {
    if (this.playbarStateSubscription) {
      this.playbarStateSubscription.unsubscribe();
    }
  }



  onTimeUpdate(timeInfo: {currentTime: number, assetDuration: number, progress: number, currentAssetIndex: number}): void {
    this.currentTime = timeInfo.currentTime;
    this.assetDuration = timeInfo.assetDuration;
    this.progress = timeInfo.progress;
    this.currentAssetIndex = timeInfo.currentAssetIndex;
  }

  onAssetSelected(index: number): void {
    if (this.canvasPlayer && index >= 0 && index < this.mediaAssets.length) {
      this.canvasPlayer.loadAsset(index);
    }
  }

  onPlay(): void {
    this.isPlaying = true;
    if (this.canvasPlayer) {
      this.canvasPlayer.play();
    } else {
      console.error('Canvas player component not available');
    }
  }

  onPause(): void {
    this.isPlaying = false;
    if (this.canvasPlayer) {
      this.canvasPlayer.pause();
    } else {
      console.error('Canvas player component not available');
    }
  }

  onSeek(progress: number): void {
    this.progress = progress;
    if (this.canvasPlayer) {
      this.canvasPlayer.seek(progress);
    } else {
      console.error('Canvas player component not available');
    }
  }
}