import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MediaAsset } from '../../../models/media-asset';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { PlaybarStateService } from '../../../services/playbar-state.service';

@Component({
  selector: 'app-asset-info',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxSliderModule],
  templateUrl: './asset-info.component.html',
  styleUrl: './asset-info.component.scss'
})
export class AssetInfoComponent implements OnInit {
  @Input() asset!: MediaAsset;
  @Output() remove = new EventEmitter<MediaAsset>();
  @Output() editDuration = new EventEmitter<{ asset: MediaAsset; duration: number }>();

  isEditing = false;
  newDuration!: number;
  originalDuration: number = 0;
  videoThumbnailUrl: string | null = null; 

  minValue: number = 0;
  maxValue: number = 0;

  options: Options = {
    floor: 0,
    ceil: 100,
    step: 1,
    minRange: 0.5,
  };

  constructor(private playbarStateService: PlaybarStateService) {}

  ngOnInit(): void {
    this.newDuration = this.asset.duration;
    if (this.asset.type === 'video') {
      this.createThumbnail(this.asset.mediaUrl);
    }
  }
  
  createThumbnail(videoUrl: string): void {
    const video = document.createElement('video');
    video.src = videoUrl;

    this.videoThumbnailUrl = 'loading';

    video.onloadedmetadata = () => (video.currentTime = 0);

    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

      this.videoThumbnailUrl = canvas.toDataURL('image/png');
    };

    video.load();
  }

  
  initializeSlider(): void {
    if (this.asset.type === 'video') {
      this.originalDuration = this.asset.originalDuration || this.asset.duration;
      
      this.minValue = this.asset.trimStart || 0;
      this.maxValue = this.asset.trimEnd || this.originalDuration;
      
      this.options.floor = 0;
      this.options.ceil = this.originalDuration;
    }
  }

  onRemove() {
    this.remove.emit(this.asset);
  }

  toggleEditDuration() {
    this.isEditing = !this.isEditing;

    if (this.isEditing) {
      this.playbarStateService.disablePlaybar();
      if (this.asset.type === 'video') {
        this.initializeSlider();
      } else {
        this.newDuration = this.asset.duration;
      }
    }
    else {
      this.playbarStateService.enablePlaybar();
    }
    
  }

  onTrimChange() {
    if (this.maxValue > this.originalDuration) {
      this.maxValue = this.originalDuration;
    }
    
    if (this.minValue >= this.maxValue) {
      this.minValue = Math.max(0, this.maxValue - 0.5);
    }
  
    this.newDuration = this.maxValue - this.minValue;
  }

  resetTrim() {
    this.minValue = 0;
    this.maxValue = this.originalDuration;
    this.newDuration = this.originalDuration;
  }

  saveDuration() {
    if (this.asset.type === 'image' && this.newDuration > 0) {
      const updatedAsset = {
        ...this.asset,
        duration: this.newDuration,
        originalDuration: this.asset.originalDuration || this.asset.duration
      };
      
      this.editDuration.emit({ 
        asset: updatedAsset, 
        duration: this.newDuration 
      });
      
    } else if (this.asset.type === 'video') {
      const updatedAsset = {
        ...this.asset,
        trimStart: this.minValue,
        trimEnd: this.maxValue,
        duration: this.maxValue - this.minValue,
        originalDuration: this.originalDuration
      };
      
      this.editDuration.emit({ 
        asset: updatedAsset, 
        duration: updatedAsset.duration 
      });
    }
    
    this.isEditing = false;
    this.playbarStateService.enablePlaybar();
  }
}