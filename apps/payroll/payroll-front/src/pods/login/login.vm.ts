export interface Login {
  email: string;
  password: string;
}

export const createEmptyLogin = (): Login => ({
  email: '',
  password: '',
});
