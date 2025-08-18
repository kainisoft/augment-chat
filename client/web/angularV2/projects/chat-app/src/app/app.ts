import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingComponent } from 'shared-lib';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('chat-app');
}
