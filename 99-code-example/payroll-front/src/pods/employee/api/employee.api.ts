import axios from 'axios';
import { employeeList } from 'common/api/employee-list.mock-data';
import { Employee } from './employee.api-model';

export const getEmployee = (id: string): Promise<Employee> =>
  Promise.resolve(
    employeeList.find((employee) => employee.id.toString() === id)
  );
