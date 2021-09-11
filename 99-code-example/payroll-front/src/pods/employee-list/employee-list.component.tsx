import React from 'react';
import { EmployeeListTableComponent } from './components';
import { Employee } from './employee-list.vm';

interface Props {
  employeeList: Employee[];
}

export const EmployeeListComponent: React.FunctionComponent<Props> = ({
  employeeList,
}) => {
  return (
    <>
      <h1>Employee list</h1>
      <EmployeeListTableComponent employeeList={employeeList} />
    </>
  );
};
