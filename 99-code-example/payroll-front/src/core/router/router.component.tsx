import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { switchRoutes } from './router';
import {
  EmployeeScene,
  LoginScene,
  EmployeeListScene,
  SignInScene,
} from 'scenes';

interface Props {
  onLogin: (login) => void;
}

export const RouterComponent: React.FunctionComponent<Props> = ({
  onLogin,
}) => {
  return (
    <Router>
      <Switch>
        <Route exact={true} path={[switchRoutes.root, switchRoutes.login]}>
          <LoginScene onLogin={onLogin} />
        </Route>
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
