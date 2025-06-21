import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import * as ChatActions from './chat.actions';
import { ChatService, WebSocketService } from '@core/services';

/**
 * Chat Effects
 * Handles side effects for chat-related actions
 */
@Injectable()
export class ChatEffects {
  private actions$ = inject(Actions);
  private chatService = inject(ChatService);
  private websocketService = inject(WebSocketService);

  /**
   * Load conversations effect
   */
  loadConversations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.loadConversations),
      switchMap(() =>
        this.chatService.getConversations().pipe(
          map((conversations) => ChatActions.loadConversationsSuccess({ conversations })),
          catchError((error) =>
            of(ChatActions.loadConversationsFailure({ error: error.message || 'Failed to load conversations' }))
          )
        )
      )
    )
  );

  /**
   * Create conversation effect
   */
  createConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.createConversation),
      switchMap(({ request }) =>
        this.chatService.createConversation(request).pipe(
          map((conversation) => ChatActions.createConversationSuccess({ conversation })),
          catchError((error) =>
            of(ChatActions.createConversationFailure({ error: error.message || 'Failed to create conversation' }))
          )
        )
      )
    )
  );

  /**
   * Update conversation effect
   */
  updateConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.updateConversation),
      switchMap(({ request }) =>
        this.chatService.updateConversation(request).pipe(
          map((conversation) => ChatActions.updateConversationSuccess({ conversation })),
          catchError((error) =>
            of(ChatActions.updateConversationFailure({ error: error.message || 'Failed to update conversation' }))
          )
        )
      )
    )
  );

  /**
   * Load messages effect
   */
  loadMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.loadMessages),
      switchMap(({ conversationId, limit, offset }) =>
        this.chatService.getMessages(conversationId, limit, offset).pipe(
          map((messages) => ChatActions.loadMessagesSuccess({ conversationId, messages })),
          catchError((error) =>
            of(ChatActions.loadMessagesFailure({ error: error.message || 'Failed to load messages' }))
          )
        )
      )
    )
  );

  /**
   * Send message effect
   */
  sendMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.sendMessage),
      switchMap(({ request }) =>
        this.chatService.sendMessage(request).pipe(
          map((message) => ChatActions.sendMessageSuccess({ message })),
          catchError((error) =>
            of(ChatActions.sendMessageFailure({ error: error.message || 'Failed to send message' }))
          )
        )
      )
    )
  );

  /**
   * Edit message effect
   */
  editMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.editMessage),
      switchMap(({ messageId, content }) =>
        this.chatService.editMessage(messageId, content).pipe(
          map((message) => ChatActions.editMessageSuccess({ message })),
          catchError((error) =>
            of(ChatActions.editMessageFailure({ error: error.message || 'Failed to edit message' }))
          )
        )
      )
    )
  );

  /**
   * Delete message effect
   */
  deleteMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.deleteMessage),
      switchMap(({ messageId }) =>
        this.chatService.deleteMessage(messageId).pipe(
          map(() => ChatActions.deleteMessageSuccess({ messageId })),
          catchError((error) =>
            of(ChatActions.deleteMessageFailure({ error: error.message || 'Failed to delete message' }))
          )
        )
      )
    )
  );

  /**
   * Mark message as read effect
   */
  markMessageAsRead$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.markMessageAsRead),
      switchMap(({ messageId, conversationId }) =>
        this.chatService.markMessageAsRead(messageId).pipe(
          map(() => ChatActions.markConversationAsRead({ conversationId })),
          catchError((error) => of()) // Silently fail for read receipts
        )
      )
    )
  );

  /**
   * Start typing effect
   */
  startTyping$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ChatActions.startTyping),
        tap(({ conversationId }) => {
          this.websocketService.send({
            type: 'typing:start',
            payload: { conversationId }
          });
        })
      ),
    { dispatch: false }
  );

  /**
   * Stop typing effect
   */
  stopTyping$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ChatActions.stopTyping),
        tap(({ conversationId }) => {
          this.websocketService.send({
            type: 'typing:stop',
            payload: { conversationId }
          });
        })
      ),
    { dispatch: false }
  );

  /**
   * Pin conversation effect
   */
  pinConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.pinConversation),
      switchMap(({ conversationId }) =>
        this.chatService.pinConversation(conversationId).pipe(
          map(() => ChatActions.pinConversation({ conversationId })),
          catchError((error) => of()) // Silently fail for UI actions
        )
      )
    )
  );

  /**
   * Mute conversation effect
   */
  muteConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.muteConversation),
      switchMap(({ conversationId }) =>
        this.chatService.muteConversation(conversationId).pipe(
          map(() => ChatActions.muteConversation({ conversationId })),
          catchError((error) => of()) // Silently fail for UI actions
        )
      )
    )
  );

  /**
   * Archive conversation effect
   */
  archiveConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.archiveConversation),
      switchMap(({ conversationId }) =>
        this.chatService.archiveConversation(conversationId).pipe(
          map(() => ChatActions.archiveConversation({ conversationId })),
          catchError((error) => of()) // Silently fail for UI actions
        )
      )
    )
  );

  /**
   * Search messages effect
   */
  searchMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.searchMessages),
      switchMap(({ request }) =>
        this.chatService.searchMessages(request).pipe(
          map((result: any) => ChatActions.searchMessagesSuccess({
            query: request.query,
            messages: result.messages,
            conversations: result.conversations,
          })),
          catchError((error) =>
            of(ChatActions.searchMessagesFailure({ error: error.message || 'Failed to search messages' }))
          )
        )
      )
    )
  );

  /**
   * Add message reaction effect
   */
  addMessageReaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.addMessageReaction),
      switchMap(({ messageId, emoji }) =>
        this.chatService.addMessageReaction(messageId, emoji).pipe(
          map(() => ChatActions.addMessageReaction({ messageId, emoji })),
          catchError((error) => of()) // Silently fail for reactions
        )
      )
    )
  );

  /**
   * Remove message reaction effect
   */
  removeMessageReaction$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.removeMessageReaction),
      switchMap(({ messageId, emoji }) =>
        this.chatService.removeMessageReaction(messageId, emoji).pipe(
          map(() => ChatActions.removeMessageReaction({ messageId, emoji })),
          catchError((error) => of()) // Silently fail for reactions
        )
      )
    )
  );
}
