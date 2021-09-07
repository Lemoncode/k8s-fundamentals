import React from 'react';
import { HashRouter as Router, Switch, Route } from 'react-router-dom';
import { switchRoutes } from './routes';
import { EmployeeScene, LoginScene, EmployeeListScene } from 'scenes';

export const RouterComponent: React.FunctionComponent = () => {
  return (
    <Router>
      <Switch>
        <Route
          exact={true}
          path={[switchRoutes.root, switchRoutes.login]}
          component={LoginScene}
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
