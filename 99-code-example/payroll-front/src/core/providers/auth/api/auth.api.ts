import axios from 'axios';
import { AuthUserContextModel } from './auth.api-model';
import { authUsersMockData } from './auth-users.mock-data';

export const validateLoginUser = async (
  email: string,
  password: string
): Promise<boolean> =>
  Promise.resolve(
    authUsersMockData.find(
      (userData) =>
        userData.login.email === email && userData.login.password === password
    )
      ? true
      : false
  );

export const getAuthorise = async (
  email: string
): Promise<AuthUserContextModel> =>
  Promise.resolve(
    authUsersMockData.find((userData) => userData.login.email === email)
  );
