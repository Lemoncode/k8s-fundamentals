import axios from 'axios';
import { Employee } from './employee.api-model';
import { employeeList } from './employee-list.mock-data';

export const getEmployeeList = async (): Promise<Employee[]> =>
  Promise.resolve(employeeList);
