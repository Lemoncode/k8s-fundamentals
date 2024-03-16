import axios from 'axios';

export const validateLoginUser = async (
  email: string,
  password: string
): Promise<boolean> =>
  Promise.resolve(
    email === 'prueba@prueba.com' && password === '1234' ? true : false
  );
