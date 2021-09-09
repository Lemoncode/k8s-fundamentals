export interface Login {
  email: string;
  password: string;
}

export interface AuthUserContextModel {
  login: Login;
  userId: string;
  name: string;
  role: string;
  isLoggedIn: boolean;
  token: string;
}
