import { gql } from '../generated/';

export const SIGNUP_MUTATION = gql(`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
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
