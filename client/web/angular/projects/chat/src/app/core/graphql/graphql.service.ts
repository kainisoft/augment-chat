import { Injectable, inject } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable, map, catchError, of } from 'rxjs';
import { ApolloQueryResult, FetchResult, FetchPolicy, ErrorPolicy } from '@apollo/client/core';

export interface GraphQLError {
  message: string;
  code?: string;
  path?: string[];
}

export interface GraphQLResponse<T = any> {
  data?: T | null;
  errors?: GraphQLError[];
  loading: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class GraphQLService {
  private readonly apollo = inject(Apollo);

  /**
   * Execute a GraphQL query
   */
  query<T = any>(
    query: string,
    variables?: Record<string, any>,
    options?: {
      fetchPolicy?: FetchPolicy;
      errorPolicy?: ErrorPolicy;
    }
  ): Observable<GraphQLResponse<T>> {
    return this.apollo
      .query<T>({
        query: gql(query),
        variables,
        fetchPolicy: options?.fetchPolicy || 'cache-first',
        errorPolicy: options?.errorPolicy || 'all',
      })
      .pipe(
        map((result: ApolloQueryResult<T>) => ({
          data: result.data,
          errors: result.errors?.map(err => ({
            message: err.message,
            path: err.path as string[],
          })),
          loading: result.loading,
        })),
        catchError((error) => {
          console.error('GraphQL Query Error:', error);
          return of({
            data: undefined,
            errors: [{ message: error.message || 'Unknown GraphQL error' }],
            loading: false,
          });
        })
      );
  }

  /**
   * Execute a GraphQL mutation
   */
  mutate<T = any>(
    mutation: string,
    variables?: Record<string, any>,
    options?: {
      errorPolicy?: ErrorPolicy;
      refetchQueries?: string[];
    }
  ): Observable<GraphQLResponse<T>> {
    return this.apollo
      .mutate<T>({
        mutation: gql(mutation),
        variables,
        errorPolicy: options?.errorPolicy || 'all',
        refetchQueries: options?.refetchQueries,
      })
      .pipe(
        map((result: FetchResult<T>) => ({
          data: result.data,
          errors: result.errors?.map(err => ({
            message: err.message,
            path: err.path as string[],
          })),
          loading: false,
        })),
        catchError((error) => {
          console.error('GraphQL Mutation Error:', error);
          return of({
            data: undefined,
            errors: [{ message: error.message || 'Unknown GraphQL error' }],
            loading: false,
          });
        })
      );
  }

  /**
   * Subscribe to GraphQL subscription
   */
  subscribe<T = any>(
    subscription: string,
    variables?: Record<string, any>
  ): Observable<GraphQLResponse<T>> {
    return this.apollo
      .subscribe<T>({
        query: gql(subscription),
        variables,
      })
      .pipe(
        map((result: FetchResult<T>) => ({
          data: result.data,
          errors: result.errors?.map(err => ({
            message: err.message,
            path: err.path as string[],
          })),
          loading: false,
        })),
        catchError((error) => {
          console.error('GraphQL Subscription Error:', error);
          return of({
            data: undefined,
            errors: [{ message: error.message || 'Unknown GraphQL error' }],
            loading: false,
          });
        })
      );
  }

  /**
   * Watch a GraphQL query for real-time updates
   */
  watchQuery<T = any>(
    query: string,
    variables?: Record<string, any>,
    options?: {
      fetchPolicy?: FetchPolicy;
      pollInterval?: number;
    }
  ): Observable<GraphQLResponse<T>> {
    return this.apollo
      .watchQuery<T>({
        query: gql(query),
        variables,
        fetchPolicy: options?.fetchPolicy || 'cache-and-network',
        pollInterval: options?.pollInterval,
      })
      .valueChanges.pipe(
        map((result: ApolloQueryResult<T>) => ({
          data: result.data,
          errors: result.errors?.map(err => ({
            message: err.message,
            path: err.path as string[],
          })),
          loading: result.loading,
        })),
        catchError((error) => {
          console.error('GraphQL Watch Query Error:', error);
          return of({
            data: undefined,
            errors: [{ message: error.message || 'Unknown GraphQL error' }],
            loading: false,
          });
        })
      );
  }

  /**
   * Clear Apollo cache
   */
  async clearCache(): Promise<void> {
    await this.apollo.client.clearStore();
  }

  /**
   * Reset Apollo store
   */
  async resetStore(): Promise<ApolloQueryResult<any>[] | null> {
    return this.apollo.client.resetStore();
  }
}
