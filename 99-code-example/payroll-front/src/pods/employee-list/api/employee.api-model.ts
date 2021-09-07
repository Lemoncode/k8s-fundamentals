export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  department: string;
}

export const createEmptyEmployee = (): Employee => ({
  id: null,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  department: '',
});
