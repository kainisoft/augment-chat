import { 
  Component, 
  ChangeDetectionStrategy, 
  inject, 
  signal, 
  DestroyRef,
  ChangeDetectorRef 
} from '@angular/core';

/**
 * Base component with signals and common functionality
 * All shared components should extend this base component
 */
@Component({
  selector: 'lib-base',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class BaseComponent {
  protected readonly destroyRef = inject(DestroyRef);
  protected readonly cdr = inject(ChangeDetectorRef);
  
  // Signal-based loading state
  protected loading = signal(false);
  protected error = signal<string | null>(null);
  
  /**
   * Set loading state
   */
  protected setLoading(loading: boolean): void {
    this.loading.set(loading);
  }
  
  /**
   * Set error state
   */
  protected setError(error: string | null): void {
    this.error.set(error);
  }
  
  /**
   * Clear error state
   */
  protected clearError(): void {
    this.error.set(null);
  }
  
  /**
   * Check if component is in loading state
   */
  protected isLoading(): boolean {
    return this.loading();
  }
  
  /**
   * Check if component has error
   */
  protected hasError(): boolean {
    return this.error() !== null;
  }
  
  /**
   * Get current error message
   */
  protected getError(): string | null {
    return this.error();
  }
}