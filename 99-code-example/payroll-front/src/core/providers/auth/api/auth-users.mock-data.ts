import { AuthUserContextApiModel } from './auth.api-model';

export const authUsersMockData: AuthUserContextApiModel[] = [
  {
    userId: '1',
    name: 'John Doe',
    role: 'admin',
    isLoggedIn: true,
    token: '1234',
    login: {
      email: 'admin@admin.com',
      password: '1234',
    },
  },
  {
    userId: '2',
    name: 'User1',
    role: 'user',
    isLoggedIn: true,
    token: '1234',
    login: {
      email: 'user@user.com',
      password: '1234',
    },
  },
];
