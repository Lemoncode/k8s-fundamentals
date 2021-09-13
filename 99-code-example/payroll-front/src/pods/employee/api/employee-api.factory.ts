import { getBaseApiUrl } from '../../../common/api/api-url.resolver';
import apiConfig from '../../../common/api/api-config';
import { Employee } from './employee.api-model';
import { employeeList } from 'common/api/employee-list.mock-data';
import axios from 'axios';

const baseApiUrl = getBaseApiUrl();

export interface EmployeeApi {
  getEmployeeFn: (id: string) => Promise<Employee>;
}

export const createEmployeeApi = (): EmployeeApi => {
  return {
    getEmployeeFn: (id: string) => {
      if (apiConfig.isMock) {
        return Promise.resolve(
          employeeList.find((employee) => employee.id.toString() === id)
        );
      }

      return axios.get(`${baseApiUrl}/api/employee/${id}`).then(({ data }) => {
        console.log(data);
        // return JSON.parse(data);
        return data;
      });
    },
  };
};
