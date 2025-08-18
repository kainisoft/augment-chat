import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme.service';
import { getThemeNames } from '../../configs/theme.config';

@Component({
  selector: 'lib-theme-demo',
  imports: [CommonModule],
  template: `
    <div class="fuse-card">
      <div class="fuse-card-header">
        <h2 class="text-xl font-semibold text-text-default">Theme System Demo</h2>
        <p class="text-text-secondary">Current theme: {{ themeService.themeDisplayName() }}</p>
      </div>
      
      <div class="space-y-4">
        <!-- Theme Selector -->
        <div>
          <label class="block text-sm font-medium text-text-default mb-2">Select Theme:</label>
          <select 
            (change)="onThemeChange($event)"
            class="fuse-input w-full"
          >
            @for (theme of availableThemes; track theme.name) {
              <option [value]="theme.name">{{ theme.displayName }}</option>
            }
          </select>
        </div>

        <!-- Dark Mode Toggle -->
        <div class="flex items-center space-x-2">
          <button 
            (click)="toggleDarkMode()"
            class="fuse-button-primary"
          >
            {{ themeService.isDarkMode() ? 'Switch to Light' : 'Switch to Dark' }}
          </button>
        </div>

        <!-- Color Palette Demo -->
        <div>
          <h3 class="text-lg font-medium text-text-default mb-3">Color Palette</h3>
          <div class="grid grid-cols-3 gap-4">
            <!-- Primary Colors -->
            <div>
              <h4 class="text-sm font-medium text-text-secondary mb-2">Primary</h4>
              <div class="space-y-1">
                <div class="h-8 bg-primary-200 rounded flex items-center justify-center text-xs">200</div>
                <div class="h-8 bg-primary-500 rounded flex items-center justify-center text-xs text-white">500</div>
                <div class="h-8 bg-primary-700 rounded flex items-center justify-center text-xs text-white">700</div>
              </div>
            </div>

            <!-- Accent Colors -->
            <div>
              <h4 class="text-sm font-medium text-text-secondary mb-2">Accent</h4>
              <div class="space-y-1">
                <div class="h-8 bg-accent-200 rounded flex items-center justify-center text-xs">200</div>
                <div class="h-8 bg-accent-500 rounded flex items-center justify-center text-xs text-white">500</div>
                <div class="h-8 bg-accent-700 rounded flex items-center justify-center text-xs text-white">700</div>
              </div>
            </div>

            <!-- Warn Colors -->
            <div>
              <h4 class="text-sm font-medium text-text-secondary mb-2">Warn</h4>
              <div class="space-y-1">
                <div class="h-8 bg-warn-200 rounded flex items-center justify-center text-xs">200</div>
                <div class="h-8 bg-warn-500 rounded flex items-center justify-center text-xs text-white">500</div>
                <div class="h-8 bg-warn-700 rounded flex items-center justify-center text-xs text-white">700</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Button Examples -->
        <div>
          <h3 class="text-lg font-medium text-text-default mb-3">Button Examples</h3>
          <div class="flex space-x-2">
            <button class="fuse-button-primary">Primary Button</button>
            <button class="fuse-button-accent">Accent Button</button>
            <button class="fuse-button-primary" disabled>Disabled Button</button>
          </div>
        </div>

        <!-- Input Examples -->
        <div>
          <h3 class="text-lg font-medium text-text-default mb-3">Input Examples</h3>
          <div class="space-y-2">
            <input type="text" placeholder="Enter text..." class="fuse-input w-full">
            <textarea placeholder="Enter message..." class="fuse-input w-full h-20 resize-none"></textarea>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }
  `]
})
export class ThemeDemoComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly availableThemes = getThemeNames().map(theme => ({
    name: `${theme.name}-light`,
    displayName: `${theme.displayName} Light`
  })).concat(
    getThemeNames().map(theme => ({
      name: `${theme.name}-dark`,
      displayName: `${theme.displayName} Dark`
    }))
  );

  protected onThemeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.themeService.setTheme(target.value);
  }

  protected toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }
}