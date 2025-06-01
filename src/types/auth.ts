import { User } from "./user";

export interface AuthState {
  user: User | null;
  token: string | null;
  loading : boolean
  error: string | null;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  accessToken: string;
}

