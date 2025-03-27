import { onError } from '@apollo/client/link/error';
import { fromPromise } from '@apollo/client';
import { useAuthStore } from '@/stores/auth.store';
import { client } from '../apollo-client';
import { gql } from '@/graphql/generated';
import { RefreshTokensMutation, RefreshTokensMutationVariables } from '@/graphql/generated/types';

const REFRESH_TOKEN_MUTATION = gql(`
  mutation RefreshTokens($input: RefreshTokenInput!) {
    refreshTokens(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        username
        avatarUrl
      }
    }
  }
`);

let isRefreshing = false;
let pendingRequests: Function[] = [];

const resolvePendingRequests = () => {
  pendingRequests.forEach((callback) => callback());
  pendingRequests = [];
};

const isLoginOperation = (operation: any) => {
  return operation.operationName === 'SingIn' || operation.operationName === 'SignUp';
};

export const errorLink = onError(({ graphQLErrors = [], operation, forward }) => {
  for (const err of graphQLErrors) {
      // Skip token refresh for login/signup operations
      if (isLoginOperation(operation)) {
        return;
      }

      if (err.message === 'Unauthorized' || err.extensions?.code === 'UNAUTHENTICATED') {
        if (!isRefreshing) {
          isRefreshing = true;
          const refreshToken = useAuthStore.getState().refreshToken;

          // If no refresh token, logout immediately
          if (!refreshToken) {
            useAuthStore.getState().signOut();

            return;
          }

          return fromPromise(
            client.mutate<RefreshTokensMutation, RefreshTokensMutationVariables>({
              mutation: REFRESH_TOKEN_MUTATION,
              variables: {
                input: {
                  refreshToken,
                },
              },
            })
            .then(({ data }) => {
              const { accessToken, refreshToken: newRefreshToken, user } = data!.refreshTokens;

              useAuthStore.getState().setAuth(accessToken, newRefreshToken, user);
              resolvePendingRequests();

              return true;
            })
            .catch((error) => {
              pendingRequests = [];
              useAuthStore.getState().signOut();
              return false;
            })
            .finally(() => {
              isRefreshing = false;
            })
          ).filter(success => success)
           .flatMap(() => forward(operation));
        }

        return fromPromise(
          new Promise(resolve => {
            pendingRequests.push(() => resolve(null));
          })
        ).flatMap(() => forward(operation));
      }
    }
});
