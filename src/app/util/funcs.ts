
export function formatTime(seconds: number): string {
    seconds = Math.round(seconds * 1000) / 1000;
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}