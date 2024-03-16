import { css } from '@emotion/css';

export const root = css`
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
`;

export const container = css`
  width: 100%;
  max-width: 350px;
  min-width: 250px;
  height: 400px;
  padding: 60px 35px 35px 35px;
  display: flex;
  flex-direction: column;
`;

export const error = css`
  color: red;
`;

export const success = css`
  color: green;
`;
