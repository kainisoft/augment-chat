import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BreakpointService } from '../../core/services/breakpoint.service';

@Component({
  selector: 'app-chat-area',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './chat-area.component.html',
  styleUrl: './chat-area.component.css',
})
export class ChatAreaComponent {
  // Inject services
  private readonly breakpointService = inject(BreakpointService);

  // Expose services to template
  protected readonly isMobile = this.breakpointService.isMobile;
  protected readonly isTablet = this.breakpointService.isTablet;
}
