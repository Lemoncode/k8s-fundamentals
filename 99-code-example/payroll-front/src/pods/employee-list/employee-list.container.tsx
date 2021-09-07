import React from 'react';
import { getEmployeeList } from './api/employee-list.api';
import { EmployeeListComponent } from './employee-list.component';

export const EmpoyeeListContainer: React.FunctionComponent = () => {
  const loadEmployeeList = () => getEmployeeList();

  React.useEffect(() => {
    loadEmployeeList();
  }, []);

  return <EmployeeListComponent employeeList={loadEmployeeList} />;
};
