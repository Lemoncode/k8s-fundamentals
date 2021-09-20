import axios from 'axios';
import { AuthUserContextApiModel, Login } from './auth.api-model';
import { authUsersMockData } from './auth-users.mock-data';

export const validateLoginUser = async (login: Login): Promise<boolean> =>
  await Promise.resolve(
    authUsersMockData.find(
      (userData) =>
        userData.login.email === login.email &&
        userData.login.password === login.password
    )
      ? true
      : false
  );

export const getAuthorise = async (
  email: string
): Promise<AuthUserContextApiModel> =>
  await Promise.resolve(
    authUsersMockData.find((userData) => userData.login.email === email)
  );
