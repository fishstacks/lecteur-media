import { Component } from '@angular/core';
import { SidebarComponent } from "./components/sidebar/sidebar.component";
import { MediaPlayerComponent } from './components/media-player/media-player.component';

@Component({
  selector: 'app-root',
  imports: [SidebarComponent, MediaPlayerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'lecteur-media-v3';
}
