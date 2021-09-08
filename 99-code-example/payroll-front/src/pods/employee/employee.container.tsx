import React from 'react';
import { useParams } from 'react-router';
import { getEmployee } from './api';
import { mapEmployeeFromApiToVm } from './employee.mappers';
import { Employee, createEmptyEmployee } from './employee.vm';
import { EmployeeComponent } from './employee.component';

export const EmployeeContainer: React.FunctionComponent = () => {
  const [employee, setEmployee] = React.useState<Employee>(
    createEmptyEmployee()
  );
  const { id } = useParams<{ id: string }>();

  const loadEmployee = async () => {
    try {
      const employee = await getEmployee(id);
      setEmployee(mapEmployeeFromApiToVm(employee));
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    loadEmployee();
  }, []);

  return <EmployeeComponent employee={employee} />;
};
