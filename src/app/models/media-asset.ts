
export class MediaAsset {
    name: string;
    type: string;
    duration: number = 0;
    mediaUrl: string;
    startTime: string = "0";
    endTime: string = "0";
    originalDuration?: number;
    trimStart?: number;
    trimEnd?: number;

    constructor(type: string, mediaUrl: string, name: string){
        this.type = type;
        this.mediaUrl = mediaUrl;
        this.name = name;

        if (type === 'image'){
            this.duration = 5;
        }

    }
}
