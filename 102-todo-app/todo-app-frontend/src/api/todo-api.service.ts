import axios from 'axios';

const { TODO_APP_API, CORS_ACTIVE } = process.env;

const isCorsActive = () => CORS_ACTIVE === 'true';
const baseUrl = () => (!!TODO_APP_API) ? `/${TODO_APP_API}` : '';
const setProtocol = (baseUrl: string) => (isCorsActive) ? `/http:/${baseUrl}` : baseUrl;

export interface TodoApi {
  _id?: string;
  title: string;
  done: boolean;
};

const url = setProtocol(baseUrl());

export const getTodos = (): Promise<TodoApi[]> => (
  axios.get<TodoApi[]>(`${url}/todos`)
    .then((value => value.data))
);

export const createTodo = (todo: TodoApi): Promise<TodoApi> => (
  axios.post<TodoApi, TodoApi>(`${url}/todos`)
);