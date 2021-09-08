import React from 'react';
import { getEmployeeList } from './api';
import { mapEmployeeListFromApiToVm } from './employee-list.mappers';
import { EmployeeListComponent } from './employee-list.component';
import { Employee, createEmptyEmployeeList } from './employee-list.vm';

export const EmployeeListContainer: React.FunctionComponent = () => {
  const [employeeList, setEmployeeList] = React.useState<Employee[]>(
    createEmptyEmployeeList()
  );

  const loadEmployeeList = async () => {
    try {
      const list = await getEmployeeList();
      setEmployeeList(mapEmployeeListFromApiToVm(list));
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    loadEmployeeList();
  }, []);

  return <EmployeeListComponent employeeList={employeeList} />;
};
