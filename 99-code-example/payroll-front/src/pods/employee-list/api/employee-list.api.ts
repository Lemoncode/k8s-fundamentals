import axios from 'axios';
import { Employee } from './employee-list.api-model';
import { employeeList } from 'common/mock-data/employee-list.mock-data';

export const getEmployeeList = async (): Promise<Employee[]> =>
  Promise.resolve(employeeList);
