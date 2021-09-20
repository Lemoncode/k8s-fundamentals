import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { switchRoutes } from './router';
import { LoginContainer } from 'pods/login';
import {
  EmployeeScene,
  LoginScene,
  EmployeeListScene,
  SignInScene,
} from 'scenes';

// interface Props {
//   onLogin: (login) => void;
// }

export const RouterComponent: React.FunctionComponent = () => {
  return (
    <Router>
      <Switch>
        <Route
          exact={true}
          path={[switchRoutes.root, switchRoutes.login]}
          component={LoginScene}
        ></Route>
        <Route
          exact={true}
          path={[switchRoutes.register]}
          component={SignInScene}
        />
        <Route
          exact={true}
          path={[switchRoutes.employee]}
          component={EmployeeScene}
        />
        <Route
          exact={true}
          path={[switchRoutes.employeeList]}
          component={EmployeeListScene}
        />
      </Switch>
    </Router>
  );
};
