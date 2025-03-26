import { gql } from '../generated/';

export const LOGIN_MUTATION = gql(`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
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
