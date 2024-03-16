import { createEmployeeListApi } from './employee-list-api.factory';

const { getEmployeeListFn } = createEmployeeListApi();

export const getEmployeeList = getEmployeeListFn;
