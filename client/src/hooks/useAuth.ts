import {
  SignUpMutation,
  SignUpMutationVariables,
  SingInMutation,
  SingInMutationVariables,
} from '@/graphql/generated/types';
import { SIGNUP_MUTATION } from '@/graphql/mutations/sign-up';
import { SIGNIN_MUTATION } from '@/graphql/mutations/sign-in';
import { useAuthStore } from '@/stores/auth.store';
import { useMutation } from '@apollo/client';

export function useAuth() {
  const { setAuth, logout } = useAuthStore();

  const [signInMutation, { loading: loginLoading }] = useMutation<
    SingInMutation,
    SingInMutationVariables
  >(SIGNIN_MUTATION);

  const [signUpMutation, { loading: registerLoading }] = useMutation<
    SignUpMutation,
    SignUpMutationVariables
  >(SIGNUP_MUTATION);

  const login = async (email: string, password: string) => {
    const { data } = await signInMutation({
      variables: {
        input: {
          email,
          password,
        },
      },
    });

    if (data) {
      const { accessToken, refreshToken, user } = data.signIn;
      setAuth(accessToken, refreshToken, user);
    }
  };

  const register = async (email: string, password: string, username: string) => {
    const { data } = await signUpMutation({
      variables: {
        input: {
          email,
          password,
          username,
        },
      },
    });

    if (data) {
      const { accessToken, refreshToken, user } = data.signUp;
      setAuth(accessToken, refreshToken, user);
    }
  };

  return {
    login,
    register,
    logout,
    isLoading: loginLoading || registerLoading,
  };
}
