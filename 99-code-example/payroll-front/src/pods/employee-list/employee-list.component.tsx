import React from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { useAuthContext } from 'core/providers/auth';
import { switchRoutes } from 'core/router';
import { EmployeeListTableComponent } from './components';
import { Employee } from './employee-list.vm';
import * as classes from './employee-list.styles';

interface Props {
  employeeList: Employee[];
}

export const EmployeeListComponent: React.FunctionComponent<Props> = ({
  employeeList,
}) => {
  const authUser = useAuthContext();
  const history = useHistory();

  const handleClick = async () => {
    await authUser?.logout;
    history.push(switchRoutes.login);
  };

  React.useEffect(() => {
    if (!authUser.isLoggedIn) {
      history.push(switchRoutes.login);
    }
  }, [authUser]);

  return (
    <>
      <AppBar position="static">
        <Toolbar className={classes.toolbar}>
          <h1>Employee List</h1>
          <Button variant="contained" color="secondary" onClick={handleClick}>
            LogOut
          </Button>
        </Toolbar>
      </AppBar>
      <EmployeeListTableComponent employeeList={employeeList} />
    </>
  );
};
