import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';

import { AuthActions, selectAuthLoading, selectAuthError, RegisterRequest } from '@store/auth';

/**
 * Register Component
 *
 * Handles user registration with form validation, password strength indicators,
 * and integration with the backend registration API
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;

  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.loading$ = this.store.select(selectAuthLoading);
    this.error$ = this.store.select(selectAuthError);
  }

  ngOnInit(): void {
    // Subscribe to auth errors
    this.error$.pipe(takeUntil(this.destroy$)).subscribe(error => {
      if (error) {
        this.snackBar.open(error, 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.registerForm.valid) {
      const userData: RegisterRequest = {
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };

      this.store.dispatch(AuthActions.register({ userData }));
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  /**
   * Toggle confirm password visibility
   */
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  /**
   * Navigate to login page
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Get password strength score (0-100)
   */
  getPasswordStrength(): number {
    const password = this.registerForm.get('password')?.value || '';
    let score = 0;

    if (password.length >= 8) score += 25;
    if (/[a-z]/.test(password)) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;

    return score;
  }

  /**
   * Get password strength label
   */
  getPasswordStrengthLabel(): string {
    const strength = this.getPasswordStrength();
    if (strength === 0) return '';
    if (strength <= 25) return 'Weak';
    if (strength <= 50) return 'Fair';
    if (strength <= 75) return 'Good';
    return 'Strong';
  }

  /**
   * Get password strength color
   */
  getPasswordStrengthColor(): string {
    const strength = this.getPasswordStrength();
    if (strength <= 25) return 'warn';
    if (strength <= 50) return 'accent';
    if (strength <= 75) return 'primary';
    return 'primary';
  }

  /**
   * Get form field error message
   */
  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);

    if (field?.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }

    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }

    if (field?.hasError('minlength')) {
      return 'Password must be at least 8 characters long';
    }

    if (field?.hasError('passwordStrength')) {
      return 'Password must contain uppercase, lowercase, and numbers';
    }

    if (fieldName === 'confirmPassword' && this.registerForm.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }

    return '';
  }

  /**
   * Check if field has error and is touched
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field?.invalid && field?.touched) ||
           (fieldName === 'confirmPassword' && this.registerForm.hasError('passwordMismatch') && !!field?.touched);
  }

  /**
   * Password strength validator
   */
  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);

    if (hasUpperCase && hasLowerCase && hasNumeric) {
      return null;
    }

    return { passwordStrength: true };
  }

  /**
   * Password match validator
   */
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}
