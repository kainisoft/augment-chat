import { 
  Component, 
  ChangeDetectionStrategy, 
  input, 
  computed 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../base/base.component';
import { User } from '../../models/user.model';

/**
 * User avatar component with status indicators
 */
@Component({
  selector: 'lib-user-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-avatar.component.html',
  styleUrl: './user-avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarComponent extends BaseComponent {
  // Required inputs
  user = input.required<User>();
  
  // Optional inputs
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  showStatus = input<boolean>(true);
  showTooltip = input<boolean>(true);
  
  // Computed signals
  protected avatarClasses = computed(() => ({
    'user-avatar': true,
    [`user-avatar--${this.size()}`]: true,
    'user-avatar--with-status': this.showStatus(),
  }));
  
  protected statusClasses = computed(() => ({
    'user-avatar__status': true,
    [`user-avatar__status--${this.user().status}`]: true,
  }));
  
  protected initials = computed(() => {
    const user = this.user();
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  });
  
  protected tooltipText = computed(() => {
    const user = this.user();
    return `${user.username || user.email} (${user.status})`;
  });
}