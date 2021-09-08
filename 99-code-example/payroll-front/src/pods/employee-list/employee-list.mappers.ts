import { mapToCollection } from 'common/mappers';
import * as vm from './employee-list.vm';
import * as apiModel from './api/employee.api-model';

export const mapEmployeeFromApiToVm = (
  employee: apiModel.Employee
): vm.Employee => ({
  ...employee,
});

export const mapEmployeeListFromApiToVm = (
  employeeList: apiModel.Employee[]
): vm.Employee[] => mapToCollection(employeeList, mapEmployeeFromApiToVm);
