export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface AuthState {
  user: User | null;
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

export interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export interface AuthApiConfig {
  baseUrl: string;
  loginEndpoint?: string;
  logoutEndpoint?: string;
  refreshEndpoint?: string;
  meEndpoint?: string;
}

export interface UseLoginOptions {
  onSuccess?: (response: LoginResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseLogoutOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface UseLoginReturn {
  login: (credentials: LoginCredentials) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

export interface UseLogoutReturn {
  logout: () => Promise<void>;
  isLoading: boolean;
}
