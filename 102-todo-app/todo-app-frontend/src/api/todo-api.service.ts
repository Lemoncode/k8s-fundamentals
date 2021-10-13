import axios from 'axios';

const isCorsActive = () => process.env.CORS_ACTIVE === 'true';
const baseUrl = () => (!!process.env.TODO_APP_API) ? `/${process.env.TODO_APP_API}` : '';
const setProtocol = (baseUrl: string) => (isCorsActive) ? `http:/${baseUrl}` : baseUrl;

export interface TodoApi {
  _id?: string;
  title: string;
  done: boolean;
};

const url = setProtocol(baseUrl());

console.log(url);

export const getTodos = (): Promise<TodoApi[]> => (
  axios.get<TodoApi[]>(`${url}/todos`)
    .then(value => value.data)
);

export const createTodo = (todo: TodoApi): Promise<TodoApi> => (
  axios.post<TodoApi>(`${url}/todos`, todo)
    .then(value => value.data)
);