export interface Employee {
  id: string;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website?: string;
  company: Company;
}

export interface Address {
  street: string;
  suite?: string;
  city?: string;
  zipcode?: string;
  geo?: { lat: string; lng: string };
}

export interface Company {
  name: string;
  catchPhrase?: string;
  bs?: string;
}

export interface Payroll {}

export const createEmptyEmployee = (): Employee => ({
  id: '',
  name: '',
  username: '',
  email: '',
  phone: '',
  address: {
    street: '',
  },
  company: {
    name: '',
  },
});
