export interface SignIn {
  name: string;
  email: string;
  password: string;
}

export const createEmptySignIn = (): SignIn => ({
  name: '',
  email: '',
  password: '',
});
