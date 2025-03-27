import { Component, ViewChild, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { MediaAsset } from '../../../models/media-asset';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-canvas-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './canvas-player.component.html',
  styleUrl: './canvas-player.component.scss'
})
export class CanvasPlayerComponent implements OnChanges, OnInit, OnDestroy, AfterViewInit {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('videoPlayer', { static: false }) videoPlayerRef!: ElementRef<HTMLVideoElement>;

  @Input() mediaAssets: MediaAsset[] = [];
  @Input() currentAssetIndex = 0;
  @Input() isPlaying = false;

  @Output() timeUpdate = new EventEmitter<{
    currentTime: number;
    assetDuration: number;
    progress: number;
    currentAssetIndex: number;
  }>();

  private timer: any;
  private imageElement = new Image();
  private imagePlayStartTime = 0;
  private imageElapsedBeforePause = 0;
  private timeUpdateSubscription?: Subscription;
  private viewInitialized = false;

  ngOnInit(): void {
    this.timeUpdateSubscription = interval(100).subscribe(() => this.updateTimeInfo());
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    if (this.mediaAssets && this.mediaAssets.length > 0) {
      setTimeout(() => this.loadAsset(0), 0);
    }
  }

  ngOnDestroy(): void {
    this.timeUpdateSubscription?.unsubscribe();
    this.clearTimer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mediaAssets'] && !changes['mediaAssets'].firstChange) {
      setTimeout(() => {
        this.currentAssetIndex = 0;
        this.loadAsset(0);
      }, 0);
    }

    if (changes['isPlaying']) {
      this.isPlaying ? this.play() : this.pause();
    }
  }

  play(): void {
    if (!this.mediaAssets.length) return;
  
    this.isPlaying = true;
    const asset = this.mediaAssets[this.currentAssetIndex];
  
    if (asset.type === 'video') {
      const video = this.videoPlayerRef?.nativeElement;
      if (video) {
        video.play().catch(err => console.error('Error playing video:', err));
      }
    } else if (asset.type === 'image') {
      this.imagePlayStartTime = Date.now() - (this.imageElapsedBeforePause * 1000);
  
      const remainingTime = asset.duration - this.imageElapsedBeforePause;
      
      if (remainingTime > 0) {
        this.timer = setTimeout(() => this.nextAsset(), remainingTime * 1000);
      } else {
        this.nextAsset();
      }
    }
  }
  
  pause(): void {
    if (!this.mediaAssets.length) return;
    
    this.isPlaying = false;
    const asset = this.mediaAssets[this.currentAssetIndex];
  
    if (asset.type === 'video') {
      this.videoPlayerRef?.nativeElement?.pause();
    } else if (asset.type === 'image') {
      this.clearTimer();
      
      const currentElapsed = Math.min(
        (Date.now() - this.imagePlayStartTime) / 1000,
        asset.duration
      );
      
      this.imageElapsedBeforePause = currentElapsed;
    }
  }
  
  seek(progressPercentage: number): void {
    if (!this.mediaAssets.length) return;
  
    const asset = this.mediaAssets[this.currentAssetIndex];
    const targetTime = (progressPercentage / 100) * asset.duration;
  
    this.clearTimer();
  
    if (asset.type === 'video') {
      const video = this.videoPlayerRef?.nativeElement;
      if (video) {
        const trimStart = asset.trimStart || 0;
        video.currentTime = trimStart + targetTime;
  
        if (this.isPlaying) {
          video.play().catch(err => console.error('Error seeking video:', err));
        }
      }
    } else if (asset.type === 'image') {
      this.imageElapsedBeforePause = targetTime;
      
      if (this.isPlaying) {
        this.imagePlayStartTime = Date.now() - (targetTime * 1000);
        const remainingTime = asset.duration - targetTime;
        
        if (remainingTime > 0) {
          this.timer = setTimeout(() => this.nextAsset(), remainingTime * 1000);
        } else {
          this.nextAsset();
        }
      }
    }
  
    this.updateTimeInfo();
  }
  
  loadAsset(index: number): void {
    if (!this.viewInitialized) return;
    
    this.clearTimer();
    this.imageElapsedBeforePause = 0;

    if (!this.mediaAssets || index >= this.mediaAssets.length) return;

    this.currentAssetIndex = index;
    const asset = this.mediaAssets[index];

    if (asset.type === 'video') {
      this.loadVideo(asset);
    } else if (asset.type === 'image') {
      this.loadImage(asset);
    }

    this.updateTimeInfo();
  }
  
  private loadImage(asset: MediaAsset): void {
    const canvas = this.canvasRef?.nativeElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
  
    this.imageElement.onload = () => {
      canvas.width = 640;
      canvas.height = 360;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(this.imageElement, 0, 0, canvas.width, canvas.height);
  
      if (this.isPlaying) {
        this.timer = setTimeout(() => this.nextAsset(), asset.duration * 1000);
      }
    };
  
    this.imageElement.src = asset.mediaUrl;
  
    this.imagePlayStartTime = Date.now();
    this.imageElapsedBeforePause = 0;
  }

  private loadVideo(asset: MediaAsset): void {
    const video = this.videoPlayerRef?.nativeElement;
    if (!video) return;
  
    video.src = asset.mediaUrl;
    video.load();
  
    const trimStart = asset.trimStart || 0;
    const trimEnd = asset.trimEnd || asset.originalDuration || asset.duration;
  
    video.onloadedmetadata = () => {
      video.currentTime = trimStart;
      if (this.isPlaying) {
        video.play().catch(err => console.error('Error playing video:', err));
      }
    };
  
    video.ontimeupdate = () => {
      if (video.currentTime >= trimEnd) {
        video.ontimeupdate = null;
        video.pause();
        this.nextAsset();
      }
    };
  }

  private nextAsset(): void {
    this.currentAssetIndex = (this.currentAssetIndex + 1) % this.mediaAssets.length;
    this.loadAsset(this.currentAssetIndex);
  }

  private getCurrentTimeInAsset(): number {
    const asset = this.mediaAssets[this.currentAssetIndex];
    if (!asset) return 0;

    if (asset.type === 'video') {
      const video = this.videoPlayerRef?.nativeElement;
      const trimStart = asset.trimStart || 0;
      return video ? Math.max(0, video.currentTime - trimStart) : 0;
    } else if (asset.type === 'image') {
      return this.isPlaying
        ? Math.min((Date.now() - this.imagePlayStartTime) / 1000, asset.duration)
        : Math.min(this.imageElapsedBeforePause, asset.duration);
    }

    return 0;
  }

  private updateTimeInfo(): void {
    if (!this.mediaAssets.length) return;

    const asset = this.mediaAssets[this.currentAssetIndex];
    const currentTime = this.getCurrentTimeInAsset();
    const progress = asset.duration > 0 ? (currentTime / asset.duration) * 100 : 0;

    this.timeUpdate.emit({
      currentTime,
      assetDuration: asset.duration,
      currentAssetIndex: this.currentAssetIndex,
      progress,
    });
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}