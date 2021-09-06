import React from 'react';
import { AppLayout } from 'layouts';
import { EmpoyeeListContainer } from 'pods/employee-list';

export const EmployeeListScene: React.FunctionComponent = () => {
  return (
    <AppLayout>
      <EmpoyeeListContainer />
    </AppLayout>
  );
};
