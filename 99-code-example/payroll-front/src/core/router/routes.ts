import { generatePath } from 'react-router-dom';

interface SwitchRoutes {
  root: string;
  login: string;
  register: string;
  employee: string;
  employeeList: string;
}

export const switchRoutes: SwitchRoutes = {
  root: '/',
  login: '/login',
  register: '/register',
  employeeList: '/employee-list',
  employee: '/employee/:id',
};

interface Routes extends Omit<SwitchRoutes, 'employee'> {
  employee: (id: string) => string;
}

export const routes: Routes = {
  ...switchRoutes,
  employee: (id) => generatePath(switchRoutes.employee, { id }),
};
