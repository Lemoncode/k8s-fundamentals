import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import * as classes from './login.styles';

export const LoginComponent: React.FunctionComponent = () => {
  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <form className={classes.form}>
          <div className={classes.fields}>
            <TextField label="Email" type="email" />
            <TextField label="Password" type="password" />
          </div>
          <Button variant="contained" color="primary">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};
