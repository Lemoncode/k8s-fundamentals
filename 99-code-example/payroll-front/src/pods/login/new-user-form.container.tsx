import React from 'react';
import { registerNewUser } from './api/form.api';
import { Login } from './login.vm';
import { NewUserFormComponent } from './new-user-form.component';

export const NewUserFormContainer: React.FunctionComponent = () => {
  const [showError, setShowError] = React.useState<boolean>(false);
  const [isRegister, setIsRegister] = React.useState<boolean>(false);

  const onRegister = async (login: Login) => {
    const result = await registerNewUser(login.email, login.password);
    if (result) {
      setIsRegister(true);
      setShowError(false);
    } else {
      setIsRegister(false);
      setShowError(true);
    }
  };

  return (
    <NewUserFormComponent
      isRegister={isRegister}
      handleSubmit={onRegister}
      showError={showError}
    />
  );
};
