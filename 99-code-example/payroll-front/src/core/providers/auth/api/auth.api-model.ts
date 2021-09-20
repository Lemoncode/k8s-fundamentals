export interface Login {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  userInfo: AuthUserContextApiModel;
}

export interface AuthUserContextApiModel {
  login: Login;
  userId: string;
  name: string;
  role: string;
  isLoggedIn: boolean;
  token: string;
}
