export interface LoginPayload {
  email: string;
  passcode: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export const authService = {
  login: async (credentials: LoginPayload): Promise<AuthResponse> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (
      credentials.email === 'admin@admin.com' &&
      credentials.passcode === 'AdminPass'
    ) {
      return {
        token: 'mock_jwt_admin_token_999',
        user: {
          id: 'usr_admin',
          username: 'Alex',
          email: credentials.email,
        },
      };
    }

    throw new Error('Invalid credentials! Use admin@admin.com / AdminPass');
  },
};