import Typography from '@mui/material/Typography';
import React, { useState, useEffect } from 'react';
import { TodoListComponent } from './tod-list.component';
import { TodoEditComponent } from './todo-edit.component';
import { TodoItem } from './todo.model';

export const TodoListContainer = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);

  useEffect(() => {
    // TODO: Call API
    setTodos([
      {
        title: 'Foo',
        id: '1',
        done: false
      }
    ])
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

  const handleCreateTodo = (todo: TodoItem) => {
    // TODO: Call to API
    const id = Date.now().toString();
    setTodos([...todos, { ...todo, id }]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Typography style={{ margin: 'auto', fontSize: '2rem' }}>
        The Awesome Todo App version: <span>{process.env.TODO_APP_TITLE}</span>
      </Typography>
      <TodoEditComponent createTodo={handleCreateTodo} />
      <TodoListComponent todos={todos} toggleDone={toggleTodo} />
    </div>
  );
};