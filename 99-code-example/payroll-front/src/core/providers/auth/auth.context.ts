import { createContext, useContext } from 'react';
import { AuthUserContextVm, createEmptyAuthUserContext } from './auth.model';

export const AuthContext = createContext<AuthUserContextVm>(
  createEmptyAuthUserContext()
);

export const useAuthContext = () => useContext<AuthUserContextVm>(AuthContext);
