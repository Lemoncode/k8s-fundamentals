import * as vm from './auth.model';
import * as apiModel from './api/auth.api-model';

export const mapAuthContextFromApiToVm = (
  authContex: apiModel.AuthUserContextApiModel
): vm.AuthUserContextVm => ({
  isLoggedIn: authContex.isLoggedIn,
  name: authContex.name,
  role: authContex.role,
  token: authContex.token,
});
