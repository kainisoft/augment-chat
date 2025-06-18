import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs/operators';

export interface BreakpointState {
  isXSmall: boolean;
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
  isXLarge: boolean;
  isHandset: boolean;
  isTablet: boolean;
  isWeb: boolean;
  isHandsetPortrait: boolean;
  isHandsetLandscape: boolean;
  isTabletPortrait: boolean;
  isTabletLandscape: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BreakpointService {
  private readonly breakpointObserver = inject(BreakpointObserver);

  // Custom breakpoints for chat application
  private readonly customBreakpoints = {
    xsmall: '(max-width: 475px)',
    small: '(min-width: 476px) and (max-width: 767px)',
    medium: '(min-width: 768px) and (max-width: 1023px)',
    large: '(min-width: 1024px) and (max-width: 1279px)',
    xlarge: '(min-width: 1280px)',
    // Chat-specific breakpoints
    chatMobile: '(max-width: 767px)',
    chatTablet: '(min-width: 768px) and (max-width: 1023px)',
    chatDesktop: '(min-width: 1024px)',
  };

  // Observe all breakpoints
  private readonly breakpointState$ = this.breakpointObserver
    .observe([
      this.customBreakpoints.xsmall,
      this.customBreakpoints.small,
      this.customBreakpoints.medium,
      this.customBreakpoints.large,
      this.customBreakpoints.xlarge,
      Breakpoints.Handset,
      Breakpoints.Tablet,
      Breakpoints.Web,
      Breakpoints.HandsetPortrait,
      Breakpoints.HandsetLandscape,
      Breakpoints.TabletPortrait,
      Breakpoints.TabletLandscape,
    ])
    .pipe(
      map(() => ({
        isXSmall: this.breakpointObserver.isMatched(this.customBreakpoints.xsmall),
        isSmall: this.breakpointObserver.isMatched(this.customBreakpoints.small),
        isMedium: this.breakpointObserver.isMatched(this.customBreakpoints.medium),
        isLarge: this.breakpointObserver.isMatched(this.customBreakpoints.large),
        isXLarge: this.breakpointObserver.isMatched(this.customBreakpoints.xlarge),
        isHandset: this.breakpointObserver.isMatched(Breakpoints.Handset),
        isTablet: this.breakpointObserver.isMatched(Breakpoints.Tablet),
        isWeb: this.breakpointObserver.isMatched(Breakpoints.Web),
        isHandsetPortrait: this.breakpointObserver.isMatched(Breakpoints.HandsetPortrait),
        isHandsetLandscape: this.breakpointObserver.isMatched(Breakpoints.HandsetLandscape),
        isTabletPortrait: this.breakpointObserver.isMatched(Breakpoints.TabletPortrait),
        isTabletLandscape: this.breakpointObserver.isMatched(Breakpoints.TabletLandscape),
      })),
      startWith({
        isXSmall: false,
        isSmall: false,
        isMedium: false,
        isLarge: false,
        isXLarge: true,
        isHandset: false,
        isTablet: false,
        isWeb: true,
        isHandsetPortrait: false,
        isHandsetLandscape: false,
        isTabletPortrait: false,
        isTabletLandscape: false,
      })
    );

  // Convert to signal
  readonly breakpointState = toSignal(this.breakpointState$, {
    initialValue: {
      isXSmall: false,
      isSmall: false,
      isMedium: false,
      isLarge: false,
      isXLarge: true,
      isHandset: false,
      isTablet: false,
      isWeb: true,
      isHandsetPortrait: false,
      isHandsetLandscape: false,
      isTabletPortrait: false,
      isTabletLandscape: false,
    },
  });

  // Computed signals for common use cases
  readonly isMobile = computed(() => {
    const state = this.breakpointState();
    return state.isXSmall || state.isSmall || state.isHandset;
  });

  readonly isTablet = computed(() => {
    const state = this.breakpointState();
    return state.isMedium || state.isTablet;
  });

  readonly isTabletOrMobile = computed(() => {
    const state = this.breakpointState();
    return this.isMobile() || state.isMedium || state.isTablet;
  });

  readonly isDesktop = computed(() => {
    const state = this.breakpointState();
    return state.isLarge || state.isXLarge || state.isWeb;
  });

  readonly currentBreakpoint = computed(() => {
    const state = this.breakpointState();
    if (state.isXSmall) return 'xs';
    if (state.isSmall) return 'sm';
    if (state.isMedium) return 'md';
    if (state.isLarge) return 'lg';
    if (state.isXLarge) return 'xl';
    return 'unknown';
  });

  // Chat-specific computed properties
  readonly shouldShowSidebar = computed(() => {
    return this.isDesktop();
  });

  readonly shouldUseBottomSheet = computed(() => {
    return this.isMobile();
  });

  readonly chatLayoutColumns = computed(() => {
    const state = this.breakpointState();
    if (state.isXSmall) return 1;
    if (state.isSmall) return 1;
    if (state.isMedium) return 2;
    if (state.isLarge) return 3;
    return 3; // XLarge
  });

  readonly messageListHeight = computed(() => {
    const state = this.breakpointState();
    if (this.isMobile()) return 'calc(100vh - 120px)';
    if (state.isTablet) return 'calc(100vh - 140px)';
    return 'calc(100vh - 160px)';
  });

  /**
   * Check if a specific breakpoint is active
   */
  isBreakpointActive(breakpoint: string): boolean {
    return this.breakpointObserver.isMatched(breakpoint);
  }

  /**
   * Observe a custom breakpoint
   */
  observeBreakpoint(breakpoint: string) {
    return this.breakpointObserver.observe(breakpoint);
  }

  /**
   * Get responsive grid columns for different screen sizes
   */
  getGridColumns(mobile = 1, tablet = 2, desktop = 3): number {
    const state = this.breakpointState();
    if (this.isMobile()) return mobile;
    if (state.isTablet || state.isMedium) return tablet;
    return desktop;
  }

  /**
   * Get responsive spacing for different screen sizes
   */
  getSpacing(mobile = '16px', tablet = '24px', desktop = '32px'): string {
    const state = this.breakpointState();
    if (this.isMobile()) return mobile;
    if (state.isTablet || state.isMedium) return tablet;
    return desktop;
  }
}
