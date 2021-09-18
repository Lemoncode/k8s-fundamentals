import { Employee } from '../employee.model';
import { Db } from 'mongodb';

export interface DalService {
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | null>;
}

export const dal = (dalClient: Db) => {
  return {
    async getEmployees(): Promise<Employee[]> {
      const documents = await dalClient.collection<Employee>('employee').find().toArray();
      return documents;
    },
    async getEmployee(id: number): Promise<Employee | null> {
      return await dalClient.collection<Employee>('employee').findOne({ id })
    }
  };
}