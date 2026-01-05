import api from "../api/axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  age: number;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  access_token: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", data);

    // Save tokens
    if (response.data.access_token) {
      localStorage.setItem("access_token", response.data.access_token);
    }

    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", data);

    // Save tokens
    if (response.data.access_token) {
      localStorage.setItem("access_token", response.data.access_token);
    }

    return response.data;
  },

  logout: async () => {
    const response = await api.delete("/auth/logout");
    localStorage.removeItem("access_token");
    return response.data;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("access_token");
  },
};
