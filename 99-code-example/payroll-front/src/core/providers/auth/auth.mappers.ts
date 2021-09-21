import * as vm from './auth.model';
import * as apiModel from './api/auth.api-model';

export const mapAuthContextFromApiToVm = (
  authContex: apiModel.AuthUserContextApiModel
): vm.AuthUserContextVm => ({
  ...authContex,
  login: () => null,
  logout: () => null,
});
