import { createEmployeeApi } from './employee-api.factory';

const { getEmployeeFn } = createEmployeeApi();

export const getEmployee = getEmployeeFn;
