import { Routes } from '@angular/router';

/**
 * Dashboard Routes
 * 
 * Routes for the main dashboard and overview pages
 */
export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/dashboard-overview/dashboard-overview.component').then(m => m.DashboardOverviewComponent),
    data: {
      title: 'Dashboard',
      description: 'Overview of your chat activity'
    }
  },
  {
    path: 'analytics',
    loadComponent: () => import('./components/dashboard-analytics/dashboard-analytics.component').then(m => m.DashboardAnalyticsComponent),
    data: {
      title: 'Analytics',
      description: 'Chat analytics and insights'
    }
  },
  {
    path: 'activity',
    loadComponent: () => import('./components/dashboard-activity/dashboard-activity.component').then(m => m.DashboardActivityComponent),
    data: {
      title: 'Activity',
      description: 'Recent activity and notifications'
    }
  }
];
