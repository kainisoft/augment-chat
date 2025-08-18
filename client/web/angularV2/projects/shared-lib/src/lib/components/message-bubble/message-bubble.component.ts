import { 
  Component, 
  ChangeDetectionStrategy, 
  input, 
  computed 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../base/base.component';
import { Message } from '../../models/message.model';
import { formatDistanceToNow } from '../../utils/date.utils';

/**
 * Reusable message bubble component with theming support
 */
@Component({
  selector: 'lib-message-bubble',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-bubble.component.html',
  styleUrl: './message-bubble.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageBubbleComponent extends BaseComponent {
  // Required inputs using new signal-based input API
  message = input.required<Message>();
  currentUserId = input.required<string>();
  
  // Optional inputs
  showAvatar = input<boolean>(true);
  showTimestamp = input<boolean>(true);
  
  // Computed signals
  protected isSent = computed(() => 
    this.message().senderId === this.currentUserId()
  );
  
  protected formattedTime = computed(() => 
    formatDistanceToNow(this.message().timestamp)
  );
  
  protected messageClasses = computed(() => ({
    'message-bubble': true,
    'message-bubble--sent': this.isSent(),
    'message-bubble--received': !this.isSent(),
    'message-bubble--with-avatar': this.showAvatar(),
  }));
}