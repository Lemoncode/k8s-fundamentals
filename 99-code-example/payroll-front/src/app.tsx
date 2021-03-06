import * as React from 'react';
import { hot } from 'react-hot-loader/root';
import { RouterComponent } from 'core/router';

export const App: React.FunctionComponent = () => {
  return <RouterComponent />;
};

export default hot(App);
