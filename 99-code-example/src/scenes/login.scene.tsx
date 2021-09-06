import React from 'react';
import { AppLayout } from 'layouts';
import { LoginContainer } from 'pods/login';

export const LoginScene: React.FunctionComponent = () => {
  return (
    <AppLayout>
      <LoginContainer />
    </AppLayout>
  );
};
