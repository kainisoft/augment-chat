import { gql } from '../generated';

export const SIGNIN_MUTATION = gql(`
  mutation SingIn($input: SignInInput!) {
    signIn(input: $input) {
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
