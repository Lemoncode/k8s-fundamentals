import { Employee } from '../employee.model';
import { Db } from 'mongodb';

export interface DalService {
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee>;
}

export const dal = (client: Db) => {
  return {};
}