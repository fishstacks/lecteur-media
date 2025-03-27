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
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('videoPlayer') videoPlayerRef!: ElementRef<HTMLVideoElement>;

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
  private startTime = 0;
  private pausedTime = 0;
  private timeUpdateSub?: Subscription;
  private viewInitialized = false;

  ngOnInit(): void {
    this.timeUpdateSub = interval(100).subscribe(() => this.emitTimeUpdate());
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    if (this.mediaAssets?.length > 0) {
      setTimeout(() => this.loadAsset(0), 0);
    }
  }

  ngOnDestroy(): void {
    this.timeUpdateSub?.unsubscribe();
    this.clearTimer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mediaAssets'] && !changes['mediaAssets'].firstChange) {
      setTimeout(() => this.loadAsset(0), 0);
    }

    if (changes['isPlaying']) {
      this.isPlaying ? this.play() : this.pause();
    }
  }

  play(): void {
    if (!this.mediaAssets.length) return;
    
    this.isPlaying = true;
    const asset = this.getCurrentAsset();
    
    if (asset.type === 'video') {
      this.getVideo()?.play().catch(err => console.error('Error playing video:', err));
    } else {
      this.startTime = Date.now() - (this.pausedTime * 1000);
      const remainingTime = asset.duration - this.pausedTime;
      
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
    const asset = this.getCurrentAsset();
    
    if (asset.type === 'video') {
      this.getVideo()?.pause();
    } else {
      this.clearTimer();
      this.pausedTime = Math.min((Date.now() - this.startTime) / 1000, asset.duration);
    }
  }
  
  seek(progressPercent: number): void {
    if (!this.mediaAssets.length) return;
    
    const asset = this.getCurrentAsset();
    const targetTime = (progressPercent / 100) * asset.duration;
    
    this.clearTimer();
    
    if (asset.type === 'video') {
      const video = this.getVideo();
      if (video) {
        video.currentTime = (asset.trimStart || 0) + targetTime;
        if (this.isPlaying) video.play().catch(err => console.error('Error after seek:', err));
      }
    } else {
      this.pausedTime = targetTime;
      
      if (this.isPlaying) {
        this.startTime = Date.now() - (targetTime * 1000);
        const remainingTime = asset.duration - targetTime;
        
        if (remainingTime > 0) {
          this.timer = setTimeout(() => this.nextAsset(), remainingTime * 1000);
        } else {
          this.nextAsset();
        }
      }
    }
    
    this.emitTimeUpdate();
  }
  
  loadAsset(index: number): void {
    if (!this.viewInitialized || index >= this.mediaAssets.length) return;
    
    this.clearTimer();
    this.pausedTime = 0;
    this.currentAssetIndex = index;
    
    const asset = this.getCurrentAsset();
    
    asset.type === 'video' ? this.loadVideo(asset) : this.loadImage(asset);
    this.emitTimeUpdate();
  }
  
  private loadImage(asset: MediaAsset): void {
    const canvas = this.canvasRef?.nativeElement;
    const video = this.videoPlayerRef?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    if (video) video.style.display = 'none';
    canvas.style.display = 'block';
    
    this.imageElement.onload = () => {
      canvas.width = 640;
      canvas.height = 360;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(this.imageElement, 0, 0, canvas.width, canvas.height);
      
      if (this.isPlaying) {
        this.timer = setTimeout(() => this.nextAsset(), asset.duration * 1000);
      }
    };
    
    this.imageElement.src = asset.mediaUrl;
    this.startTime = Date.now();
    this.pausedTime = 0;
  }
  
  private loadVideo(asset: MediaAsset): void {
    const video = this.getVideo();
    const canvas = this.canvasRef?.nativeElement;
    if (!video) return;
    
    if (canvas) canvas.style.display = 'none';
    video.style.display = 'block';
    
    this.resetVideoEvents(video);
    
    video.src = asset.mediaUrl;
    video.load();
    
    const trimStart = asset.trimStart ?? 0;
    const trimEnd = asset.trimEnd ?? asset.originalDuration ?? asset.duration;
    
    let ended = false;
    
    video.onloadedmetadata = () => {
      if (!asset.duration) asset.duration = video.duration;
      if (!asset.originalDuration) asset.originalDuration = video.duration;
      
      video.currentTime = trimStart;
      if (this.isPlaying) video.play().catch(err => console.error('Error playing:', err));
    };
    
    video.ontimeupdate = () => {
      if (asset.trimEnd !== undefined && video.currentTime >= trimEnd && !ended) {
        ended = true;
        video.pause();
        this.nextAsset();
      }
    };
    
    video.onended = () => {
      if (!ended) {
        ended = true;
        this.nextAsset();
      }
    };
  }
  
  private nextAsset(): void {
    this.currentAssetIndex = (this.currentAssetIndex + 1) % this.mediaAssets.length;
    this.loadAsset(this.currentAssetIndex);
  }
  
  private getCurrentAsset(): MediaAsset {
    return this.mediaAssets[this.currentAssetIndex];
  }
  
  private getVideo(): HTMLVideoElement | null {
    return this.videoPlayerRef?.nativeElement ?? null;
  }
  
  private getCurrentTime(): number {
    const asset = this.getCurrentAsset();
    if (!asset) return 0;
    
    if (asset.type === 'video') {
      const video = this.getVideo();
      const trimStart = asset.trimStart || 0;
      return video ? Math.max(0, video.currentTime - trimStart) : 0;
    } else {
      return this.isPlaying
        ? Math.min((Date.now() - this.startTime) / 1000, asset.duration)
        : Math.min(this.pausedTime, asset.duration);
    }
  }
  
  private emitTimeUpdate(): void {
    if (!this.mediaAssets.length) return;
    
    const asset = this.getCurrentAsset();
    const currentTime = this.getCurrentTime();
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
  
  private resetVideoEvents(video: HTMLVideoElement): void {
    video.onloadedmetadata = null;
    video.ontimeupdate = null;
    video.onended = null;
  }
}