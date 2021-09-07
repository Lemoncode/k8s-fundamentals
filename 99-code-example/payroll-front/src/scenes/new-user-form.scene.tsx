import React from 'react';
import { AppLayout } from 'layouts';
import { NewUserFormContainer } from 'pods/login';

export const NewUserScene: React.FunctionComponent = () => {
  return (
    <AppLayout>
      <NewUserFormContainer />
    </AppLayout>
  );
};
