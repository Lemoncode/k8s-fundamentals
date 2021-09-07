interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  department: string;
}

export const createEmptyEmployee = (): Employee => ({
  id: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  department: '',
});
