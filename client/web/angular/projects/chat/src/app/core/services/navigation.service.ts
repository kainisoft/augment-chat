import { Injectable, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: number;
  children?: NavigationItem[];
}

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

/**
 * Navigation Service
 * 
 * Manages navigation state, active routes, and breadcrumbs
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  // Current active route section
  private readonly _activeSection = signal<string>('dashboard');
  public readonly activeSection = this._activeSection.asReadonly();

  // Current breadcrumbs
  private readonly _breadcrumbs = signal<BreadcrumbItem[]>([]);
  public readonly breadcrumbs = this._breadcrumbs.asReadonly();

  // Navigation items
  public readonly navigationItems: NavigationItem[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: 'dashboard', 
      route: '/dashboard' 
    },
    { 
      id: 'chats', 
      label: 'Chats', 
      icon: 'chat', 
      route: '/chats', 
      badge: 5,
      children: [
        { id: 'chats-all', label: 'All Chats', icon: 'chat', route: '/chats' },
        { id: 'chats-groups', label: 'Groups', icon: 'group', route: '/chats/groups' },
        { id: 'chats-archived', label: 'Archived', icon: 'archive', route: '/chats/archived' }
      ]
    },
    { 
      id: 'contacts', 
      label: 'Contacts', 
      icon: 'contacts', 
      route: '/contacts',
      children: [
        { id: 'contacts-all', label: 'All Contacts', icon: 'contacts', route: '/contacts' },
        { id: 'contacts-requests', label: 'Requests', icon: 'person_add', route: '/contacts/requests' },
        { id: 'contacts-blocked', label: 'Blocked', icon: 'block', route: '/contacts/blocked' }
      ]
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: 'person', 
      route: '/profile',
      children: [
        { id: 'profile-overview', label: 'Overview', icon: 'person', route: '/profile' },
        { id: 'profile-edit', label: 'Edit Profile', icon: 'edit', route: '/profile/edit' },
        { id: 'profile-security', label: 'Security', icon: 'security', route: '/profile/security' },
        { id: 'profile-privacy', label: 'Privacy', icon: 'privacy_tip', route: '/profile/privacy' }
      ]
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: 'settings', 
      route: '/settings',
      children: [
        { id: 'settings-appearance', label: 'Appearance', icon: 'palette', route: '/settings/appearance' },
        { id: 'settings-chat', label: 'Chat', icon: 'chat_bubble', route: '/settings/chat' },
        { id: 'settings-notifications', label: 'Notifications', icon: 'notifications', route: '/settings/notifications' },
        { id: 'settings-privacy', label: 'Privacy', icon: 'privacy_tip', route: '/settings/privacy' },
        { id: 'settings-data', label: 'Data', icon: 'storage', route: '/settings/data' },
        { id: 'settings-about', label: 'About', icon: 'info', route: '/settings/about' }
      ]
    }
  ];

  constructor(private router: Router) {
    this.initializeNavigation();
  }

  /**
   * Initialize navigation tracking
   */
  private initializeNavigation(): void {
    // Track route changes and update active section
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => event as NavigationEnd)
    ).subscribe(event => {
      this.updateActiveSection(event.url);
      this.updateBreadcrumbs(event.url);
    });

    // Set initial active section
    this.updateActiveSection(this.router.url);
    this.updateBreadcrumbs(this.router.url);
  }

  /**
   * Update active section based on current URL
   */
  private updateActiveSection(url: string): void {
    const segments = url.split('/').filter(segment => segment);
    
    if (segments.length === 0) {
      this._activeSection.set('dashboard');
      return;
    }

    const firstSegment = segments[0];
    
    // Map URL segments to navigation sections
    switch (firstSegment) {
      case 'dashboard':
        this._activeSection.set('dashboard');
        break;
      case 'chats':
      case 'chat':
        this._activeSection.set('chats');
        break;
      case 'contacts':
        this._activeSection.set('contacts');
        break;
      case 'profile':
        this._activeSection.set('profile');
        break;
      case 'settings':
        this._activeSection.set('settings');
        break;
      default:
        this._activeSection.set('dashboard');
        break;
    }
  }

  /**
   * Update breadcrumbs based on current URL
   */
  private updateBreadcrumbs(url: string): void {
    const segments = url.split('/').filter(segment => segment);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with home
    breadcrumbs.push({ label: 'Home', route: '/dashboard' });

    // Build breadcrumbs from URL segments
    let currentRoute = '';
    for (const segment of segments) {
      currentRoute += `/${segment}`;
      
      // Find navigation item for this segment
      const navItem = this.findNavigationItem(segment);
      if (navItem) {
        breadcrumbs.push({
          label: navItem.label,
          route: currentRoute
        });
      } else {
        // Fallback for dynamic segments (like IDs)
        breadcrumbs.push({
          label: this.formatSegment(segment),
          route: currentRoute
        });
      }
    }

    this._breadcrumbs.set(breadcrumbs);
  }

  /**
   * Find navigation item by ID or route segment
   */
  private findNavigationItem(segment: string): NavigationItem | null {
    for (const item of this.navigationItems) {
      if (item.id === segment || item.route.includes(segment)) {
        return item;
      }
      
      if (item.children) {
        for (const child of item.children) {
          if (child.id === segment || child.route.includes(segment)) {
            return child;
          }
        }
      }
    }
    return null;
  }

  /**
   * Format URL segment for display
   */
  private formatSegment(segment: string): string {
    // Convert kebab-case to Title Case
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Navigate to a specific route
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  /**
   * Get navigation item by ID
   */
  getNavigationItem(id: string): NavigationItem | null {
    for (const item of this.navigationItems) {
      if (item.id === id) {
        return item;
      }
      
      if (item.children) {
        for (const child of item.children) {
          if (child.id === id) {
            return child;
          }
        }
      }
    }
    return null;
  }

  /**
   * Check if a route is currently active
   */
  isRouteActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }

  /**
   * Get the current route title from route data
   */
  getCurrentRouteTitle(): string {
    // This would typically come from route data
    // For now, return a default based on active section
    const activeSection = this._activeSection();
    const navItem = this.getNavigationItem(activeSection);
    return navItem?.label || 'Chat Application';
  }
}
