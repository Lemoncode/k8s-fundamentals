export interface Employee {
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

export const createEmptyEmployeeList = (): Employee[] => [
  {
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
  },
];
