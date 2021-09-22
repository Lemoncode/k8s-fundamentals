import React from 'react';
import { trackPromise } from 'react-promise-tracker';
import { getEmployeeList } from './api';
import { mapEmployeeListFromApiToVm } from './employee-list.mappers';
import { EmployeeListComponent } from './employee-list.component';
import { Employee, createEmptyEmployeeList } from './employee-list.vm';
import { LoadingSpinnerComponent } from 'common/components/spinner';

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

  return (
    <>
      <LoadingSpinnerComponent />
      <EmployeeListComponent employeeList={employeeList} />
    </>
  );
};
