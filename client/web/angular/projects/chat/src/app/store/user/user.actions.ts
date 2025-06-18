import { createAction, props } from '@ngrx/store';
import { Contact, UserPreferences, UserProfile } from './user.state';

/**
 * User Profile Actions
 */
export const loadUserProfile = createAction('[User] Load User Profile');

export const loadUserProfileSuccess = createAction(
  '[User] Load User Profile Success',
  props<{ profile: UserProfile }>()
);

export const loadUserProfileFailure = createAction(
  '[User] Load User Profile Failure',
  props<{ error: string }>()
);

export const updateUserProfile = createAction(
  '[User] Update User Profile',
  props<{ profile: Partial<UserProfile> }>()
);

export const updateUserProfileSuccess = createAction(
  '[User] Update User Profile Success',
  props<{ profile: UserProfile }>()
);

export const updateUserProfileFailure = createAction(
  '[User] Update User Profile Failure',
  props<{ error: string }>()
);

/**
 * User Preferences Actions
 */
export const loadUserPreferences = createAction('[User] Load User Preferences');

export const loadUserPreferencesSuccess = createAction(
  '[User] Load User Preferences Success',
  props<{ preferences: UserPreferences }>()
);

export const loadUserPreferencesFailure = createAction(
  '[User] Load User Preferences Failure',
  props<{ error: string }>()
);

export const updateUserPreferences = createAction(
  '[User] Update User Preferences',
  props<{ preferences: Partial<UserPreferences> }>()
);

export const updateUserPreferencesSuccess = createAction(
  '[User] Update User Preferences Success',
  props<{ preferences: UserPreferences }>()
);

export const updateUserPreferencesFailure = createAction(
  '[User] Update User Preferences Failure',
  props<{ error: string }>()
);

/**
 * Contacts Actions
 */
export const loadContacts = createAction('[User] Load Contacts');

export const loadContactsSuccess = createAction(
  '[User] Load Contacts Success',
  props<{ contacts: Contact[] }>()
);

export const loadContactsFailure = createAction(
  '[User] Load Contacts Failure',
  props<{ error: string }>()
);

export const addContact = createAction(
  '[User] Add Contact',
  props<{ userId: string }>()
);

export const addContactSuccess = createAction(
  '[User] Add Contact Success',
  props<{ contact: Contact }>()
);

export const addContactFailure = createAction(
  '[User] Add Contact Failure',
  props<{ error: string }>()
);

export const removeContact = createAction(
  '[User] Remove Contact',
  props<{ contactId: string }>()
);

export const removeContactSuccess = createAction(
  '[User] Remove Contact Success',
  props<{ contactId: string }>()
);

export const removeContactFailure = createAction(
  '[User] Remove Contact Failure',
  props<{ error: string }>()
);

export const updateContactStatus = createAction(
  '[User] Update Contact Status',
  props<{ contactId: string; isOnline: boolean; lastSeen?: Date }>()
);

/**
 * Favorites Actions
 */
export const toggleFavoriteContact = createAction(
  '[User] Toggle Favorite Contact',
  props<{ contactId: string }>()
);

export const toggleFavoriteContactSuccess = createAction(
  '[User] Toggle Favorite Contact Success',
  props<{ contactId: string; isFavorite: boolean }>()
);

export const toggleFavoriteContactFailure = createAction(
  '[User] Toggle Favorite Contact Failure',
  props<{ error: string }>()
);

/**
 * Block/Unblock Actions
 */
export const blockUser = createAction(
  '[User] Block User',
  props<{ userId: string }>()
);

export const blockUserSuccess = createAction(
  '[User] Block User Success',
  props<{ userId: string }>()
);

export const blockUserFailure = createAction(
  '[User] Block User Failure',
  props<{ error: string }>()
);

export const unblockUser = createAction(
  '[User] Unblock User',
  props<{ userId: string }>()
);

export const unblockUserSuccess = createAction(
  '[User] Unblock User Success',
  props<{ userId: string }>()
);

export const unblockUserFailure = createAction(
  '[User] Unblock User Failure',
  props<{ error: string }>()
);

/**
 * Search Actions
 */
export const searchUsers = createAction(
  '[User] Search Users',
  props<{ query: string }>()
);

export const searchUsersSuccess = createAction(
  '[User] Search Users Success',
  props<{ users: UserProfile[] }>()
);

export const searchUsersFailure = createAction(
  '[User] Search Users Failure',
  props<{ error: string }>()
);

/**
 * General Actions
 */
export const clearUserError = createAction('[User] Clear User Error');

export const setUserLoading = createAction(
  '[User] Set User Loading',
  props<{ loading: boolean }>()
);
