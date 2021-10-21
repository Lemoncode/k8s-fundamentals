import Typography from '@mui/material/Typography';
import React, { useState, useEffect } from 'react';
import { TodoListComponent } from './tod-list.component';
import { TodoEditComponent } from './todo-edit.component';
import { TodoItem } from './todo.model';
import { apiToItem, apiToItemCollection } from '../services/api-mapper.service';
import { getTodos, createTodo } from '../api/todo-api.service';

export const TodoListContainer = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);

  useEffect(() => {
    getTodos()
      .then(apiToItemCollection)
      .then((todos) => {
        setTodos(todos);
      })
      .catch(console.log);
  }, []);

  const toggleTodo = (id: string) => {
    const newTodos = todos.map((t) => {
      if (t.id === id) {
        t.done = !t.done;
      }
      return t;
    });

    setTodos(newTodos);
  };

  // TODO: Handle in a safer way
  const handleCreateTodo = (todo: TodoItem) => {
    const { title, done } = todo;
    createTodo({ title, done })
      .then((result) => {
        const newTodo = apiToItem(result);
        setTodos([...todos, newTodo]);
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Typography style={{ margin: 'auto', fontSize: '2.5rem' }}>
        The Awesome Todo App version: <span>{process.env.TODO_APP_TITLE}</span>
      </Typography>
      <TodoEditComponent createTodo={handleCreateTodo} />
      <TodoListComponent todos={todos} toggleDone={toggleTodo} />
    </div>
  );
};