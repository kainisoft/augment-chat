import { Injectable, inject, signal } from '@angular/core';
import { Observable, Subject, BehaviorSubject, fromEvent, NEVER } from 'rxjs';
import { map, filter, catchError, retry, delay, takeUntil } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  enableHeartbeat?: boolean;
  heartbeatInterval?: number;
}

export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
  id?: string;
  timestamp?: number;
}

export enum WebSocketConnectionState {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR',
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private config: WebSocketConfig = {
    url: environment.websocket.url,
    reconnectInterval: environment.websocket.reconnectInterval,
    maxReconnectAttempts: environment.websocket.maxReconnectAttempts,
    enableHeartbeat: environment.websocket.enableHeartbeat,
    heartbeatInterval: environment.websocket.heartbeatInterval,
  };

  // Connection state management
  private readonly connectionState = signal<WebSocketConnectionState>(
    WebSocketConnectionState.DISCONNECTED
  );
  private readonly reconnectAttempts = signal(0);

  // Message streams
  private readonly messageSubject = new Subject<WebSocketMessage>();
  private readonly errorSubject = new Subject<Event>();
  private readonly destroySubject = new Subject<void>();

  // Heartbeat management
  private heartbeatTimer: number | null = null;

  // Public observables
  readonly connectionState$ = this.connectionState.asReadonly();
  readonly messages$ = this.messageSubject.asObservable();
  readonly errors$ = this.errorSubject.asObservable();

  /**
   * Connect to WebSocket server
   */
  connect(config?: Partial<WebSocketConfig>): Observable<WebSocketConnectionState> {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    if (this.socket?.readyState === WebSocket.OPEN) {
      return new BehaviorSubject(WebSocketConnectionState.CONNECTED);
    }

    this.connectionState.set(WebSocketConnectionState.CONNECTING);
    this.createConnection();

    return new BehaviorSubject(this.connectionState());
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.destroySubject.next();
    this.stopHeartbeat();
    
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
    }
    
    this.connectionState.set(WebSocketConnectionState.DISCONNECTED);
    this.reconnectAttempts.set(0);
  }

  /**
   * Send message to WebSocket server
   */
  send<T = any>(message: WebSocketMessage<T>): boolean {
    if (this.socket?.readyState === WebSocket.OPEN) {
      try {
        const messageWithTimestamp = {
          ...message,
          timestamp: Date.now(),
        };
        this.socket.send(JSON.stringify(messageWithTimestamp));
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        return false;
      }
    }
    
    console.warn('WebSocket is not connected. Message not sent:', message);
    return false;
  }

  /**
   * Listen for specific message types
   */
  onMessage<T = any>(messageType: string): Observable<WebSocketMessage<T>> {
    return this.messages$.pipe(
      filter(message => message.type === messageType),
      map(message => message as WebSocketMessage<T>)
    );
  }

  /**
   * Get current connection state
   */
  getConnectionState(): WebSocketConnectionState {
    return this.connectionState();
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.connectionState() === WebSocketConnectionState.CONNECTED;
  }

  private createConnection(): void {
    try {
      this.socket = new WebSocket(this.config.url, this.config.protocols);
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.connectionState.set(WebSocketConnectionState.ERROR);
      this.handleReconnect();
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection opened
    this.socket.addEventListener('open', () => {
      console.log('WebSocket connected');
      this.connectionState.set(WebSocketConnectionState.CONNECTED);
      this.reconnectAttempts.set(0);
      this.startHeartbeat();
    });

    // Message received
    this.socket.addEventListener('message', (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.messageSubject.next(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    });

    // Connection closed
    this.socket.addEventListener('close', (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.connectionState.set(WebSocketConnectionState.DISCONNECTED);
      this.stopHeartbeat();
      
      // Attempt reconnection if not a clean close
      if (event.code !== 1000) {
        this.handleReconnect();
      }
    });

    // Connection error
    this.socket.addEventListener('error', (event) => {
      console.error('WebSocket error:', event);
      this.connectionState.set(WebSocketConnectionState.ERROR);
      this.errorSubject.next(event);
    });
  }

  private handleReconnect(): void {
    const currentAttempts = this.reconnectAttempts();
    
    if (currentAttempts < this.config.maxReconnectAttempts!) {
      this.connectionState.set(WebSocketConnectionState.RECONNECTING);
      this.reconnectAttempts.set(currentAttempts + 1);
      
      console.log(`Attempting to reconnect (${currentAttempts + 1}/${this.config.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.createConnection();
      }, this.config.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
      this.connectionState.set(WebSocketConnectionState.ERROR);
    }
  }

  private startHeartbeat(): void {
    if (!this.config.enableHeartbeat) return;

    this.heartbeatTimer = window.setInterval(() => {
      if (this.isConnected()) {
        this.send({
          type: 'ping',
          payload: { timestamp: Date.now() },
        });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}
