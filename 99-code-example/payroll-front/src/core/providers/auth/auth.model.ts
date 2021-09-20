export interface Login {
  email: string;
  password: string;
}
export interface AuthUserContextVm {
  name: string;
  role: string;
  isLoggedIn: boolean;
  token: string;
  logout?: (id: string) => void;
  login?: (login: Login) => void;
}

export const createEmptyAuthUserContext = (): AuthUserContextVm => ({
  name: '',
  role: '',
  isLoggedIn: false,
  token: '',
  login: null,
});
