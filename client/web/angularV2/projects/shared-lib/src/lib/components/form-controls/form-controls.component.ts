import { 
  Component, 
  ChangeDetectionStrategy, 
  input, 
  output, 
  signal,
  computed,
  forwardRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ControlValueAccessor, 
  NG_VALUE_ACCESSOR, 
  ReactiveFormsModule 
} from '@angular/forms';
import { BaseComponent } from '../base/base.component';
import { ValidationResult } from '../../models/validation.model';

/**
 * Form controls with validation
 */
@Component({
  selector: 'lib-form-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-controls.component.html',
  styleUrl: './form-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormControlsComponent),
      multi: true
    }
  ]
})
export class FormControlsComponent extends BaseComponent implements ControlValueAccessor {
  // Input properties
  type = input<'text' | 'email' | 'password' | 'textarea'>('text');
  placeholder = input<string>('');
  label = input<string>('');
  required = input<boolean>(false);
  disabled = input<boolean>(false);
  maxLength = input<number | null>(null);
  rows = input<number>(3);
  
  // Validation
  validationResult = input<ValidationResult | null>(null);
  
  // Output events
  valueChange = output<string>();
  blur = output<void>();
  focus = output<void>();
  
  // Internal state
  protected value = signal<string>('');
  private touched = signal<boolean>(false);
  private focused = signal<boolean>(false);
  
  // ControlValueAccessor callbacks
  private onChange = (value: string) => {};
  private onTouched = () => {};
  
  // Computed properties
  protected override hasError = computed(() => {
    const validation = this.validationResult();
    return !!(validation && !validation.isValid && this.touched());
  });
  
  protected errorMessage = computed(() => {
    const validation = this.validationResult();
    return validation?.errors?.[0] || null;
  });
  
  protected inputClasses = computed(() => ({
    'form-input': true,
    'form-input--error': this.hasError(),
    'form-input--focused': this.focused(),
    'form-input--disabled': this.disabled(),
  }));
  
  protected characterCount = computed(() => {
    const max = this.maxLength();
    const current = this.value().length;
    return max ? `${current}/${max}` : null;
  });
  
  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value.set(value || '');
  }
  
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    // Handled by input signal
  }
  
  // Event handlers
  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const value = target.value;
    
    this.value.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
  }
  
  protected onBlur(): void {
    this.touched.set(true);
    this.focused.set(false);
    this.onTouched();
    this.blur.emit();
  }
  
  protected onFocus(): void {
    this.focused.set(true);
    this.focus.emit();
  }
  
  // Public methods
  getValue(): string {
    return this.value();
  }
  
  isTouched(): boolean {
    return this.touched();
  }
  
  isFocused(): boolean {
    return this.focused();
  }
}