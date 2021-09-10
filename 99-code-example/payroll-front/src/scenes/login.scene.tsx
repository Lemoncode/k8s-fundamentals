import React from 'react';
import { AppLayout } from 'layouts';
import { LoginContainer } from 'pods/login';

interface Props {
  onLogin: (login) => void;
}

export const LoginScene: React.FunctionComponent<Props> = ({ onLogin }) => {
  return (
    <AppLayout>
      <LoginContainer onLogin={onLogin} />
    </AppLayout>
  );
};
