export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface AuthProviderProps {
  children: React.ReactNode;
  loginPath?: string;
  onAuthError?: (error: Error) => void;
}

export interface ProtectedRouterProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
