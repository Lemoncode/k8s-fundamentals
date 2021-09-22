import React from 'react';
import { usePromiseTracker, promiseTrackerHoc } from 'react-promise-tracker';
import CircularProgress from '@material-ui/core/CircularProgress';

const SpinnerComponent: React.FunctionComponent = () => {
  const { promiseInProgress } = usePromiseTracker();
  return promiseInProgress && <CircularProgress />;
};

export const LoadingSpinnerComponent = promiseTrackerHoc(SpinnerComponent);
