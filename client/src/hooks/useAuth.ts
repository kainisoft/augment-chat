import { LoginMutation, LoginMutationVariables } from '@/graphql/generated/types';
import { LOGIN_MUTATION } from '@/graphql/mutations/login';
import { useAuthStore } from '@/stores/auth.store';
import { useMutation } from '@apollo/client';

export function useAuth() {
  const { setAuth, logout } = useAuthStore();

  const [loginMutation, { loading }] = useMutation<LoginMutation, LoginMutationVariables>(
    LOGIN_MUTATION
  );

  const login = async (email: string, password: string) => {
    const { data } = await loginMutation({
      variables: {
        input: {
          email,
          password,
        },
      },
    });

    if (data) {
      const { accessToken, refreshToken, user } = data.login;

      setAuth(accessToken, refreshToken, user);
    }
  };

  return {
    login,
    logout,
    isLoading: loading,
  };
}
