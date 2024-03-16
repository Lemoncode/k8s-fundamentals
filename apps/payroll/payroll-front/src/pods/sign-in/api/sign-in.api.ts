import axios from 'axios';
import { SignIn } from './sign-in.apiModel';

export const registerNewUser = async (data: SignIn): Promise<boolean> =>
  Promise.resolve(data ? true : false);

export const checkEmailExists = async (email: string): Promise<boolean> =>
  Promise.resolve(email !== 'email@error.com' ? true : false);
