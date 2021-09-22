import axios from 'axios';
import { trackPromise } from 'react-promise-tracker';
import { Employee } from './employee-list.api-model';
import { employeeList } from 'common/api/employee-list.mock-data';

export const getEmployeeList = async (): Promise<Employee[]> =>
  trackPromise(Promise.resolve(employeeList));
