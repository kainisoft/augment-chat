import { 
  Component, 
  ChangeDetectionStrategy, 
  input 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../base/base.component';

/**
 * Loading states and skeleton components
 */
@Component({
  selector: 'lib-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent extends BaseComponent {
  // Input properties
  type = input<'spinner' | 'skeleton' | 'dots' | 'pulse'>('spinner');
  size = input<'sm' | 'md' | 'lg'>('md');
  message = input<string>('');
  
  // Skeleton-specific inputs
  lines = input<number>(3);
  showAvatar = input<boolean>(false);
  
  // Helper method for template
  protected getLines(): number[] {
    return Array(this.lines()).fill(0);
  }
}