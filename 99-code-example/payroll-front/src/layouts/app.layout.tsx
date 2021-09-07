import React from 'react';
import StylesProvider from '@material-ui/styles/StylesProvider';
import CssBaseline from '@material-ui/core/CssBaseline';
import * as innerClasses from './app.layout.styles';

export const AppLayout: React.FunctionComponent = (props) => {
  const { children } = props;

  return (
    <StylesProvider injectFirst>
      <CssBaseline />
      <div className={innerClasses.root}>{children}</div>
    </StylesProvider>
  );
};
