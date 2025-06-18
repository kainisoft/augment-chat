import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import * as UserActions from './user.actions';
import { UserService } from '../../core/services/user.service';

/**
 * User Effects
 * Handles side effects for user-related actions
 */
@Injectable()
export class UserEffects {
  private actions$ = inject(Actions);
  private userService = inject(UserService);

  /**
   * Load user profile effect
   */
  loadUserProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUserProfile),
      switchMap(() =>
        this.userService.getUserProfile().pipe(
          map((profile) => UserActions.loadUserProfileSuccess({ profile })),
          catchError((error) =>
            of(UserActions.loadUserProfileFailure({ error: error.message || 'Failed to load profile' }))
          )
        )
      )
    )
  );

  /**
   * Update user profile effect
   */
  updateUserProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUserProfile),
      switchMap(({ profile }) =>
        this.userService.updateUserProfile(profile).pipe(
          map((updatedProfile) => UserActions.updateUserProfileSuccess({ profile: updatedProfile })),
          catchError((error) =>
            of(UserActions.updateUserProfileFailure({ error: error.message || 'Failed to update profile' }))
          )
        )
      )
    )
  );

  /**
   * Load user preferences effect
   */
  loadUserPreferences$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUserPreferences),
      switchMap(() =>
        this.userService.getUserPreferences().pipe(
          map((preferences) => UserActions.loadUserPreferencesSuccess({ preferences })),
          catchError((error) =>
            of(UserActions.loadUserPreferencesFailure({ error: error.message || 'Failed to load preferences' }))
          )
        )
      )
    )
  );

  /**
   * Update user preferences effect
   */
  updateUserPreferences$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.updateUserPreferences),
      switchMap(({ preferences }) =>
        this.userService.updateUserPreferences(preferences).pipe(
          map((updatedPreferences) => UserActions.updateUserPreferencesSuccess({ preferences: updatedPreferences })),
          catchError((error) =>
            of(UserActions.updateUserPreferencesFailure({ error: error.message || 'Failed to update preferences' }))
          )
        )
      )
    )
  );

  /**
   * Load contacts effect
   */
  loadContacts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadContacts),
      switchMap(() =>
        this.userService.getContacts().pipe(
          map((contacts) => UserActions.loadContactsSuccess({ contacts })),
          catchError((error) =>
            of(UserActions.loadContactsFailure({ error: error.message || 'Failed to load contacts' }))
          )
        )
      )
    )
  );

  /**
   * Add contact effect
   */
  addContact$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.addContact),
      switchMap(({ userId }) =>
        this.userService.addContact(userId).pipe(
          map((contact) => UserActions.addContactSuccess({ contact })),
          catchError((error) =>
            of(UserActions.addContactFailure({ error: error.message || 'Failed to add contact' }))
          )
        )
      )
    )
  );

  /**
   * Remove contact effect
   */
  removeContact$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.removeContact),
      switchMap(({ contactId }) =>
        this.userService.removeContact(contactId).pipe(
          map(() => UserActions.removeContactSuccess({ contactId })),
          catchError((error) =>
            of(UserActions.removeContactFailure({ error: error.message || 'Failed to remove contact' }))
          )
        )
      )
    )
  );

  /**
   * Toggle favorite contact effect
   */
  toggleFavoriteContact$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.toggleFavoriteContact),
      switchMap(({ contactId }) =>
        this.userService.toggleFavoriteContact(contactId).pipe(
          map((result) => UserActions.toggleFavoriteContactSuccess({ 
            contactId, 
            isFavorite: result.isFavorite 
          })),
          catchError((error) =>
            of(UserActions.toggleFavoriteContactFailure({ error: error.message || 'Failed to toggle favorite' }))
          )
        )
      )
    )
  );

  /**
   * Block user effect
   */
  blockUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.blockUser),
      switchMap(({ userId }) =>
        this.userService.blockUser(userId).pipe(
          map(() => UserActions.blockUserSuccess({ userId })),
          catchError((error) =>
            of(UserActions.blockUserFailure({ error: error.message || 'Failed to block user' }))
          )
        )
      )
    )
  );

  /**
   * Unblock user effect
   */
  unblockUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.unblockUser),
      switchMap(({ userId }) =>
        this.userService.unblockUser(userId).pipe(
          map(() => UserActions.unblockUserSuccess({ userId })),
          catchError((error) =>
            of(UserActions.unblockUserFailure({ error: error.message || 'Failed to unblock user' }))
          )
        )
      )
    )
  );

  /**
   * Search users effect
   */
  searchUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.searchUsers),
      switchMap(({ query }) =>
        this.userService.searchUsers(query).pipe(
          map((users) => UserActions.searchUsersSuccess({ users })),
          catchError((error) =>
            of(UserActions.searchUsersFailure({ error: error.message || 'Failed to search users' }))
          )
        )
      )
    )
  );
}
