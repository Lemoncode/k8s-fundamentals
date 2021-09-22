import axios from 'axios';
import { trackPromise } from 'react-promise-tracker';
import { AuthUserContextApiModel, Login } from './auth.api-model';
import { authUsersMockData } from './auth-users.mock-data';

export const validateLoginUser = async (login: Login): Promise<boolean> =>
  trackPromise(
    authUsersMockData.find(
      (userData) =>
        userData.login.email === login.email &&
        userData.login.password === login.password
    )
      ? Promise.resolve(true)
      : Promise.resolve(false)
  );

export const getAuthorise = async (
  email: string
): Promise<AuthUserContextApiModel> =>
  trackPromise(
    Promise.resolve(
      authUsersMockData.find((userData) => userData.login.email === email)
    )
  );
