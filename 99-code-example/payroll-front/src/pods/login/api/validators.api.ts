import axios from 'axios';

export const existEmail = async (email: string): Promise<boolean> =>
  Promise.resolve(email === 'email@error.com' ? true : false);
