import { Component, EventEmitter, Input, OnInit, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MediaAsset } from '../../../models/media-asset';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-thumbnail-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './thumbnail-bar.component.html',
  styleUrl: './thumbnail-bar.component.scss'
})
export class ThumbnailBarComponent implements OnInit, OnChanges {
  @Input() mediaAssets: MediaAsset[] = [];
  @Input() currentAssetIndex = 0;
  @Output() assetSelected = new EventEmitter<number>();

  videoThumbnails: { [url: string]: string } = {};

  constructor() {}

  ngOnInit(): void {
    this.processNewVideos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mediaAssets']) {
      this.processNewVideos();
    }
  }

  processNewVideos(): void {
    if (!this.mediaAssets || this.mediaAssets.length === 0) {
      return;
    }

    const videosToProcess = this.mediaAssets.filter(
      (asset) => asset.type === 'video' && !this.videoThumbnails[asset.mediaUrl]
    );
    videosToProcess.forEach((asset) => this.createThumbnail(asset.mediaUrl));
  }

  createThumbnail(videoUrl: string): void {
    const video = document.createElement('video');
    video.src = videoUrl;

    this.videoThumbnails[videoUrl] = 'loading';

    video.onloadedmetadata = () => (video.currentTime = 0);

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      this.videoThumbnails[videoUrl]= canvas.toDataURL('image/png');
    };

    video.load();
  }
  
  getThumbnailWidth(asset: MediaAsset): number {
    const totalDuration = this.mediaAssets.reduce((sum, curr) => sum + curr.duration, 0);
    return totalDuration ? (asset.duration / totalDuration) * 100 : 100 / this.mediaAssets.length;
  }

  hasThumbnail(asset: MediaAsset): string | boolean {
    if (asset.type === 'image') return true;
    return this.videoThumbnails[asset.mediaUrl] && 
           this.videoThumbnails[asset.mediaUrl] !== 'loading' && 
           this.videoThumbnails[asset.mediaUrl] !== 'error';
  }

  getThumbnailImage(asset: MediaAsset): string {
    if (asset.type === 'image') {
      return asset.mediaUrl;
    }
  
    if (asset.type === 'video' && 
        this.videoThumbnails[asset.mediaUrl] && 
        this.videoThumbnails[asset.mediaUrl] !== 'loading' && 
        this.videoThumbnails[asset.mediaUrl] !== 'error') {
      return this.videoThumbnails[asset.mediaUrl];
    }
  
    return asset.mediaUrl;
  }
  
  onThumbnailClick(index: number): void {
    this.assetSelected.emit(index);
  }

  isActive(index: number): boolean {
    return index === this.currentAssetIndex;
  }
}