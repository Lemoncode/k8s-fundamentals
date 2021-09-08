import React from 'react';
import { AppLayout } from 'layouts';
import { SignInContainer } from 'pods/sign-in';

export const SignInScene: React.FunctionComponent = () => {
  return (
    <AppLayout>
      <SignInContainer />
    </AppLayout>
  );
};
