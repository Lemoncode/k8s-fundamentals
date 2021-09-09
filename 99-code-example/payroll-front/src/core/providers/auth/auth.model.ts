export interface AuthUserContextModel {
  name: string;
  role: string;
  isLoggedIn: boolean;
  token: string;
  logout?: () => void;
}

export const createEmptyAuthUserContext = (): AuthUserContextModel => ({
  name: '',
  role: '',
  isLoggedIn: false,
  token: '',
  logout: null,
});
