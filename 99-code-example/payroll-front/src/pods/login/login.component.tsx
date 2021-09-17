import React from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { switchRoutes } from 'core/router';
import { LoginFormComponent } from './components';
import { Login } from './login.vm';
import * as classes from './login.styles';

interface Props {
  showError: boolean;
  handleSubmit: (login: Login) => void;
}

export const LoginComponent: React.FunctionComponent<Props> = ({
  showError,
  handleSubmit,
}) => {
  const history = useHistory();
  const handleClick = () => history.push(switchRoutes.register);

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <LoginFormComponent handleSubmit={handleSubmit} />
        {showError && (
          <div className={classes.error}>Email or password incorrect</div>
        )}
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
