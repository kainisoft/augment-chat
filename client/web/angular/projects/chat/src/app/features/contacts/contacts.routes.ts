import { Routes } from '@angular/router';

/**
 * Contacts Routes
 * 
 * Routes for contact management functionality
 */
export const contactsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/contacts-list/contacts-list.component').then(m => m.ContactsListComponent),
    data: {
      title: 'Contacts',
      description: 'Manage your contacts'
    }
  },
  {
    path: 'add',
    loadComponent: () => import('./components/add-contact/add-contact.component').then(m => m.AddContactComponent),
    data: {
      title: 'Add Contact',
      description: 'Add a new contact'
    }
  },
  {
    path: 'requests',
    loadComponent: () => import('./components/contact-requests/contact-requests.component').then(m => m.ContactRequestsComponent),
    data: {
      title: 'Contact Requests',
      description: 'Pending contact requests'
    }
  },
  {
    path: 'blocked',
    loadComponent: () => import('./components/blocked-contacts/blocked-contacts.component').then(m => m.BlockedContactsComponent),
    data: {
      title: 'Blocked Contacts',
      description: 'Manage blocked contacts'
    }
  },
  {
    path: ':id',
    loadComponent: () => import('./components/contact-profile/contact-profile.component').then(m => m.ContactProfileComponent),
    data: {
      title: 'Contact Profile',
      description: 'View contact details'
    }
  }
];
