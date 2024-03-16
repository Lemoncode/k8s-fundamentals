import * as apiModel from './api';
import * as vm from './employee.vm';

export const mapEmployeeFromApiToVm = (
  employee: apiModel.Employee
): vm.Employee => ({
  ...employee,
  id: employee.id.toString(),
});
