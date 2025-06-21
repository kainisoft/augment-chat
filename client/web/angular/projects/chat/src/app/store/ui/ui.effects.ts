import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { fromEvent, timer } from 'rxjs';
import { debounceTime, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import * as UiActions from './ui.actions';
import { selectThemeConfig, selectLayoutConfig } from './ui.selectors';
import { ThemeService } from '@core/services';

/**
 * UI Effects
 * Handles side effects for UI-related actions
 */
@Injectable()
export class UiEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private themeService = inject(ThemeService);

  /**
   * Theme mode change effect
   * Updates the theme service when theme mode changes
   */
  themeChange$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UiActions.setThemeMode, UiActions.updateThemeConfig),
        withLatestFrom(this.store.select(selectThemeConfig)),
        tap(([action, themeConfig]) => {
          this.themeService.setTheme(themeConfig.mode);
          this.themeService.setPrimaryColor(themeConfig.primaryColor);
          this.themeService.setAccentColor(themeConfig.accentColor);
        })
      ),
    { dispatch: false }
  );

  /**
   * Theme colors change effect
   * Updates the theme service when colors change
   */
  themeColorsChange$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(UiActions.setThemeColors),
        tap(({ primaryColor, accentColor }) => {
          this.themeService.setPrimaryColor(primaryColor);
          this.themeService.setAccentColor(accentColor);
        })
      ),
    { dispatch: false }
  );

  /**
   * Auto-hide notifications effect
   * Automatically hides notifications after their duration expires
   */
  autoHideNotifications$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UiActions.showNotification),
      switchMap(({ notification }) => {
        if (notification.persistent || !notification.duration) {
          return [];
        }
        
        return timer(notification.duration).pipe(
          map(() => UiActions.hideNotification({ 
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9) 
          }))
        );
      })
    )
  );

  /**
   * Online status monitoring effect
   * Monitors browser online/offline status
   */
  onlineStatusMonitoring$ = createEffect(() =>
    fromEvent(window, 'online').pipe(
      map(() => UiActions.setOnlineStatus({ isOnline: true }))
    )
  );

  /**
   * Offline status monitoring effect
   * Monitors browser online/offline status
   */
  offlineStatusMonitoring$ = createEffect(() =>
    fromEvent(window, 'offline').pipe(
      map(() => UiActions.setOnlineStatus({ isOnline: false }))
    )
  );

  /**
   * Activity tracking effect
   * Tracks user activity for idle detection
   */
  activityTracking$ = createEffect(() =>
    fromEvent(document, 'mousemove').pipe(
      debounceTime(1000),
      map(() => UiActions.updateLastActivity())
    )
  );

  /**
   * Keyboard activity tracking effect
   * Tracks keyboard activity for idle detection
   */
  keyboardActivityTracking$ = createEffect(() =>
    fromEvent(document, 'keypress').pipe(
      debounceTime(1000),
      map(() => UiActions.updateLastActivity())
    )
  );

  /**
   * Responsive breakpoint monitoring effect
   * Monitors window resize for responsive breakpoints
   */
  responsiveMonitoring$ = createEffect(() =>
    fromEvent(window, 'resize').pipe(
      debounceTime(250),
      map(() => {
        const width = window.innerWidth;
        let breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
        
        if (width < 576) {
          breakpoint = 'xs';
        } else if (width < 768) {
          breakpoint = 'sm';
        } else if (width < 992) {
          breakpoint = 'md';
        } else if (width < 1200) {
          breakpoint = 'lg';
        } else {
          breakpoint = 'xl';
        }
        
        return UiActions.setBreakpoint({ breakpoint });
      })
    )
  );

  /**
   * Mobile detection effect
   * Detects mobile devices and updates state
   */
  mobileDetection$ = createEffect(() =>
    fromEvent(window, 'resize').pipe(
      debounceTime(250),
      map(() => {
        const isMobile = window.innerWidth < 768;
        return UiActions.setIsMobile({ isMobile });
      })
    )
  );

  /**
   * Sidebar auto-close on mobile effect
   * Automatically closes sidebar on mobile when screen size changes
   */
  sidebarAutoClose$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UiActions.setIsMobile),
      withLatestFrom(this.store.select(selectLayoutConfig)),
      switchMap(([{ isMobile }, layoutConfig]) => {
        if (isMobile && layoutConfig.sidebarOpen && layoutConfig.sidebarMode === 'side') {
          return [
            UiActions.setSidebarMode({ mode: 'over' }),
            UiActions.setSidebarOpen({ open: false })
          ];
        }
        return [];
      })
    )
  );

  /**
   * Escape key modal close effect
   * Closes modals when escape key is pressed
   */
  escapeKeyModalClose$ = createEffect(() =>
    fromEvent<KeyboardEvent>(document, 'keydown').pipe(
      map(event => {
        if (event.key === 'Escape') {
          return UiActions.closeModal();
        }
        return null;
      })
    ).pipe(
      switchMap(action => action ? [action] : [])
    )
  );

  /**
   * Search query persistence effect
   * Adds search queries to recent searches
   */
  searchQueryPersistence$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UiActions.setSearchQuery),
      debounceTime(500),
      switchMap(({ query }) => {
        if (query.trim().length > 2) {
          return [UiActions.addRecentSearch({ query: query.trim() })];
        }
        return [];
      })
    )
  );

  /**
   * Accessibility preferences monitoring effect
   * Monitors system accessibility preferences
   */
  accessibilityMonitoring$ = createEffect(() =>
    fromEvent(window, 'load').pipe(
      map(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
        
        return [
          UiActions.setReducedMotion({ enabled: prefersReducedMotion }),
          UiActions.setHighContrast({ enabled: prefersHighContrast })
        ];
      }),
      switchMap(actions => actions)
    )
  );
}
