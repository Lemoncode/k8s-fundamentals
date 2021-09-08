export interface Employee {
  id: string;
  name: string;
  username: string;
  email: string;
  address: Address;
  phone: string;
  website?: string;
  company: Company;
  payrollInfo: PayrollMonth;
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

export interface PayrollMonth {
  month: number;
  year: number;
  payrollList: PayrollData[];
  totalAccruals: number;
  totalWithholds: number;
  total: number;
}

export interface PayrollData {
  selected: boolean;
  id: string;
  access: boolean;
  date: Date;
  type: string;
  cost: number;
  accrual: number;
  amount: number;
  withhold: number;
}

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
  payrollInfo: {
    month: null,
    payrollList: [],
    total: null,
    totalAccruals: null,
    totalWithholds: null,
    year: null,
  },
});
