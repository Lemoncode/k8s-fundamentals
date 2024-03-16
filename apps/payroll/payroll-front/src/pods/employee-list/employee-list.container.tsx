import React from 'react';
import { getEmployeeList } from './api';
import { mapEmployeeListFromApiToVm } from './employee-list.mappers';
import { EmployeeListComponent } from './employee-list.component';
import { Employee, createEmptyEmployeeList } from './employee-list.vm';

export const EmployeeListContainer: React.FunctionComponent = () => {
  const [employeeList, setEmployeeList] = React.useState<Employee[]>(
    createEmptyEmployeeList()
  );

  const loadEmployeeList = () => {
    getEmployeeList()
      .then(mapEmployeeListFromApiToVm)
      .then(setEmployeeList)
      .catch(console.log);
  };

  React.useEffect(() => {
    loadEmployeeList();
  }, []);

  return <EmployeeListComponent employeeList={employeeList} />;
};
