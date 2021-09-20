import React from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { switchRoutes } from 'core/router';
import { LoginFormComponent } from './components';
import * as classes from './login.styles';

export const LoginComponent: React.FunctionComponent = () => {
  const history = useHistory();
  const handleClick = () => history.push(switchRoutes.register);

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <LoginFormComponent />
        <div>
          New user?{' '}
          <Button variant="text" onClick={handleClick}>
            Register.
          </Button>
        </div>
      </div>
    </div>
  );
};
