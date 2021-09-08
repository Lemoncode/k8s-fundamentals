import React from 'react';
import { AppLayout } from 'layouts';
import { SignInContainer } from 'pods/sign-in';

export const NewUserScene: React.FunctionComponent = () => {
  return (
    <AppLayout>
      <SignInContainer />
    </AppLayout>
  );
};
