import { getBaseApiUrl } from '../../../common/api/api-url.resolver';
import apiConfig from '../../../common/api/api-config';
import { Employee } from './employee-list.api-model';
import { employeeList } from 'common/api/employee-list.mock-data';
import axios from 'axios';

const baseApiUrl = getBaseApiUrl();

export interface EmployeeListApi {
  getEmployeeListFn: () => Promise<Employee[]>;
}

export const createEmployeeListApi = (): EmployeeListApi => {
  return {
    getEmployeeListFn: () => {
      if (apiConfig.isMock) {
        return Promise.resolve(employeeList);
      }

      return axios.get(`${baseApiUrl}/api/employee/`);
    },
  };
};
