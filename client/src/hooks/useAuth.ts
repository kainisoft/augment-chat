import { LOGIN_MUTATION } from "@/graphql/mutations/login";
import { useAuthStore } from "@/stores/auth.store";
import { useMutation } from "@apollo/client";

interface LoginInput {
  email: string;
  password: string;
}

interface LoginResponse {
  login: {
    accessToken: string;
    user: {
      id: string;
      email: string;
      username: string;
      avatarUrl?: string;
    };
  };
}

export function useAuth() {
  const { setAuth, logout } = useAuthStore();

  const [loginMutation, { loading }] = useMutation<LoginResponse, { input: LoginInput }>(
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
      const { accessToken, user } = data.login;

      setAuth(accessToken, user);
    }
  };

  return {
    login,
    logout,
    isLoading: loading,
  };
}
