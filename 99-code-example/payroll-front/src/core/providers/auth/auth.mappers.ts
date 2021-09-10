import * as vm from './auth.model';
import * as apiModel from './api/auth.api-model';

export const mapAuthContextFromApiToVm = (
  authContex: apiModel.AuthUserContextModel
): vm.AuthUserContextModel => ({
  isLoggedIn: authContex.isLoggedIn,
  name: authContex.name,
  role: authContex.role,
  token: authContex.token,
});
