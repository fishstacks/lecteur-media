import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MediaAsset } from '../../models/media-asset';
import { MediaService } from '../../services/media.service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { AssetInfoComponent } from './asset-info/asset-info.component';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [DragDropModule, AssetInfoComponent, NgFor],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  mediaAssets: MediaAsset[] = [];
  
  
  constructor(private mediaService: MediaService) {}

  ngOnInit(): void {
    this.mediaService.getMedia().subscribe((assets) => {
      this.mediaAssets = assets;
    });
  }

  onDrop(event: CdkDragDrop<MediaAsset[]>): void {
    moveItemInArray(this.mediaAssets, event.previousIndex, event.currentIndex);
    this.mediaService.reorderMedia(event.previousIndex, event.currentIndex);
  }

  removeAsset(asset: MediaAsset): void {
    this.mediaService.removeAsset(asset);
  }

  updateAssetDuration(event: { asset: MediaAsset; duration: number }) {
    this.mediaService.editDuration(event.asset, event.duration);
  }
  
  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];
    if (file) this.mediaService.addFile(file);
  }
}