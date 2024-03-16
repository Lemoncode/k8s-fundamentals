import React from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { formValidation } from '../sign-in.validations';
import { SignIn, createEmptySignIn } from '../sign-in.vm';
import * as classes from './sign-in-form.styles';

interface Props {
  handleSubmit: (signIn: SignIn) => void;
}


export const SignInFormComponent: React.FunctionComponent<Props> = ({handleSubmit}) => {

  return (
    <Formik
    onSubmit={handleSubmit}
    initialValues={createEmptySignIn()}
    validate={formValidation.validateForm}
  >
    {({ isSubmitting, setFieldValue }) => (
      <Form className={classes.form}>
        <div className={classes.fields}>
          <ErrorMessage
            name="name"
            component="div"
            className={classes.error}
          />
          <TextField
            label="Name"
            type="name"
            name="name"
            onChange={(event) =>
              setFieldValue('name', event.target.value)
            }
            required
          />
          <ErrorMessage
            name="email"
            component="div"
            className={classes.error}
          />
          <TextField
            label="Email"
            type="email"
            name="email"
            onChange={(event) =>
              setFieldValue('email', event.target.value)
            }
            required
          />
          <ErrorMessage
            name="password"
            component="div"
            className={classes.error}
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            onChange={(event) =>
              setFieldValue('password', event.target.value)
            }
            required
          />
        </div>
        <Button
          variant="contained"
          color="secondary"
          type="submit"
          disabled={isSubmitting}
        >
          Register
        </Button>
      </Form>
    )}
  </Formik>
  )
}
