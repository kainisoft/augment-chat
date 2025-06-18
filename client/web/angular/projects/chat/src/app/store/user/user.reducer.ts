import { createReducer, on } from '@ngrx/store';
import { UserState, initialUserState } from './user.state';
import * as UserActions from './user.actions';

/**
 * User reducer
 * Handles state changes for user-related actions
 */
export const userReducer = createReducer(
  initialUserState,

  // Profile Actions
  on(UserActions.loadUserProfile, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(UserActions.loadUserProfileSuccess, (state, { profile }) => ({
    ...state,
    profile,
    loading: false,
    error: null,
  })),

  on(UserActions.loadUserProfileFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(UserActions.updateUserProfile, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(UserActions.updateUserProfileSuccess, (state, { profile }) => ({
    ...state,
    profile,
    loading: false,
    error: null,
  })),

  on(UserActions.updateUserProfileFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Preferences Actions
  on(UserActions.loadUserPreferences, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(UserActions.loadUserPreferencesSuccess, (state, { preferences }) => ({
    ...state,
    preferences,
    loading: false,
    error: null,
  })),

  on(UserActions.loadUserPreferencesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(UserActions.updateUserPreferences, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(UserActions.updateUserPreferencesSuccess, (state, { preferences }) => ({
    ...state,
    preferences,
    loading: false,
    error: null,
  })),

  on(UserActions.updateUserPreferencesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Contacts Actions
  on(UserActions.loadContacts, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(UserActions.loadContactsSuccess, (state, { contacts }) => ({
    ...state,
    contacts,
    loading: false,
    error: null,
  })),

  on(UserActions.loadContactsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(UserActions.addContact, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(UserActions.addContactSuccess, (state, { contact }) => ({
    ...state,
    contacts: [...state.contacts, contact],
    loading: false,
    error: null,
  })),

  on(UserActions.addContactFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(UserActions.removeContact, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(UserActions.removeContactSuccess, (state, { contactId }) => ({
    ...state,
    contacts: state.contacts.filter(contact => contact.id !== contactId),
    favoriteContacts: state.favoriteContacts.filter(id => id !== contactId),
    loading: false,
    error: null,
  })),

  on(UserActions.removeContactFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(UserActions.updateContactStatus, (state, { contactId, isOnline, lastSeen }) => ({
    ...state,
    contacts: state.contacts.map(contact =>
      contact.id === contactId
        ? { ...contact, isOnline, lastSeen }
        : contact
    ),
  })),

  // Favorites Actions
  on(UserActions.toggleFavoriteContactSuccess, (state, { contactId, isFavorite }) => ({
    ...state,
    contacts: state.contacts.map(contact =>
      contact.id === contactId
        ? { ...contact, isFavorite }
        : contact
    ),
    favoriteContacts: isFavorite
      ? [...state.favoriteContacts, contactId]
      : state.favoriteContacts.filter(id => id !== contactId),
    loading: false,
    error: null,
  })),

  on(UserActions.toggleFavoriteContactFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Block/Unblock Actions
  on(UserActions.blockUserSuccess, (state, { userId }) => ({
    ...state,
    blockedUsers: [...state.blockedUsers, userId],
    contacts: state.contacts.filter(contact => contact.userId !== userId),
    favoriteContacts: state.favoriteContacts.filter(id => id !== userId),
    loading: false,
    error: null,
  })),

  on(UserActions.blockUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(UserActions.unblockUserSuccess, (state, { userId }) => ({
    ...state,
    blockedUsers: state.blockedUsers.filter(id => id !== userId),
    loading: false,
    error: null,
  })),

  on(UserActions.unblockUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // General Actions
  on(UserActions.clearUserError, (state) => ({
    ...state,
    error: null,
  })),

  on(UserActions.setUserLoading, (state, { loading }) => ({
    ...state,
    loading,
  }))
);
