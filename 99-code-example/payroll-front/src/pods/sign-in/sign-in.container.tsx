import React from 'react';
import { registerNewUser } from './api/sign-in.api';
import { mapSignInFromVmToApiModel } from './sign-in.mappers';
import { SignIn } from './sign-in.vm';
import { SignInComponent } from './sign-in.component';

export const SignInContainer: React.FunctionComponent = () => {
  const [isRegister, setIsRegister] = React.useState<boolean>(false);

  const onRegister = async (data: SignIn) => {
    const result = await registerNewUser(mapSignInFromVmToApiModel(data));

    result ? setIsRegister(true) : setIsRegister(false);
  };

  return <SignInComponent isRegister={isRegister} handleSubmit={onRegister} />;
};
