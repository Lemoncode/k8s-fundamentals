import * as apiModel from './api/sign-in.apiModel';
import * as vm from './sign-in.vm';

export const mapSignInFromVmToApiModel = (
  signIn: vm.SignIn
): apiModel.SignIn => ({
  ...signIn,
  id: '',
});
