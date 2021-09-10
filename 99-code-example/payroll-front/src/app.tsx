import * as React from 'react';
import { hot } from 'react-hot-loader/root';
import { RouterComponent } from 'core/router';
import { AuthProvider } from 'core/providers/auth';

export const App: React.FunctionComponent = () => {
  return (
    <AuthProvider>
      <RouterComponent onLogin={AuthProvider} />;
    </AuthProvider>
  );
};

export default hot(App);
