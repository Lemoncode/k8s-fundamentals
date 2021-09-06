import * as React from 'react';
import { HashRouter, Switch, Route, BrowserRouter } from 'react-router-dom';
import { paths } from 'core';
import { LoginScene, EmployeeScene } from 'scenes';

export const App: React.FunctionComponent = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route
          exact={true}
          path={[paths.root, paths.index]}
          component={LoginScene}
        />
        <Route
          exact={true}
          path={[paths.employeeList]}
          component={EmployeeScene}
        />
      </Switch>
    </BrowserRouter>
  );
};

export default App;
