import React from 'react';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { switchRoutes } from 'core/router';
import { SignInFormComponent } from './components';
import { SignIn } from './sign-in.vm';
import * as classes from './sign-in.styles';

interface Props {
  isRegister: boolean;
  handleSubmit: (signIn: SignIn) => void;
}

export const SignInComponent: React.FunctionComponent<Props> = ({
  isRegister,
  handleSubmit,
}) => {
  const history = useHistory();

  const handleClick = () => history.push(switchRoutes.login);

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <SignInFormComponent handleSubmit={handleSubmit} />
        {isRegister && (
          <div className={classes.success}>
            Register user success.
            <Button variant="text" onClick={handleClick}>
              Return to login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
