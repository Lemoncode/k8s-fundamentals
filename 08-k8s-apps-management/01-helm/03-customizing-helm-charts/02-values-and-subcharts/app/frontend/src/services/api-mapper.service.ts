import { TodoApi } from '../api/todo-api.service';
import { TodoItem } from '../components/todo.model';

export const apiToItem = (todo: TodoApi): TodoItem => {
  return {
    id: todo._id,
    ...todo,
  };
};

export const apiToItemCollection = (todos: TodoApi[]): TodoItem[] => (
  todos.map(apiToItem)
);
