import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MediaAsset } from '../models/media-asset';
import { formatTime } from '../util/funcs';

@Injectable({
  providedIn: 'root'
})
export class MediaService {
  private mediaAssets: MediaAsset[] = [];
  private mediaAssetsSubject = new BehaviorSubject<MediaAsset[]>(this.mediaAssets);


  constructor() { 
    this.refreshMediaList;
  }

  getMedia(): Observable<MediaAsset[]> {
    return this.mediaAssetsSubject.asObservable();
  }

  async addFile(file: File): Promise<void> {
    const type = file.type.startsWith('video') ? 'video' : 'image';
    const name = file.name.split('.').slice(0, -1).join('.');
    const url = URL.createObjectURL(file);
   
    const newAsset = new MediaAsset(type, url, name);
    

    if (type === 'video'){
      await this.setVideoDuration(newAsset);
    }

    this.mediaAssets.push(newAsset);
    this.refreshMediaList();
  }

  private setVideoDuration(asset: MediaAsset): Promise<void> {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.src = asset.mediaUrl;
  
        video.onloadedmetadata = () => {
          asset.duration = Math.round(video.duration);
          resolve();
        };
  
        video.onerror = () => {
          console.error('Error loading video metadata');
          resolve();
        };

        video.load();
     
    });
  }

  removeAsset(asset: MediaAsset): void {
    this.mediaAssets = this.mediaAssets.filter((a) => a !== asset);
    this.refreshMediaList();
  }

  private refreshMediaList(): void {
    let currentTime = 0;
    this.mediaAssets.forEach((asset)=> {
      asset.startTime = formatTime(currentTime);
      currentTime += asset.duration;
      asset.endTime = formatTime(currentTime);
    })
    this.mediaAssetsSubject.next([...this.mediaAssets]);
  }

  reorderMedia(previousIndex: number, currentIndex: number): void{
    const movedAsset = this.mediaAssets.splice(previousIndex, 1)[0]  ;
    this.mediaAssets.splice(currentIndex, 0, movedAsset);
    this.refreshMediaList;

  }

  editDuration(asset:  MediaAsset, duration: number): void {
    const assetIndex = this.mediaAssets.findIndex((a) => a.mediaUrl === asset.mediaUrl);

    if (assetIndex !== -1) {
      this.mediaAssets[assetIndex] = {
        ...asset,
        duration: duration
      }
      this.refreshMediaList();
    }
  }

  

  


}
