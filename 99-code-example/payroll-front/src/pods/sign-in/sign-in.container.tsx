import React from 'react';
import { registerNewUser } from './api/sign-in.api';
import { mapSignInFromVmToApiModel } from './sign-in.mappers';
import { SignIn } from './sign-in.vm';
import { SignInComponent } from './sign-in.component';

export const SignInContainer: React.FunctionComponent = () => {
  const [showError, setShowError] = React.useState<boolean>(false);
  const [isRegister, setIsRegister] = React.useState<boolean>(false);

  const onRegister = async (data: SignIn) => {
    const result = await registerNewUser(mapSignInFromVmToApiModel(data));

    if (result) {
      setIsRegister(true);
      setShowError(false);
    } else {
      setIsRegister(false);
      setShowError(true);
    }
  };

  return (
    <SignInComponent
      isRegister={isRegister}
      handleSubmit={onRegister}
      showError={showError}
    />
  );
};
