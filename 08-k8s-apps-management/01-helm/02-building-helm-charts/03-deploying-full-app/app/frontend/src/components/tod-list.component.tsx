import List from '@mui/material/List';
import React from 'react';
import { TodoItemComponent } from './todo-item.component';
import { TodoItem } from './todo.model';

interface Props {
  todos: TodoItem[];
  toggleDone: (id: string) => void;
}

export const TodoListComponent = (props: Props) => {
  const { todos, toggleDone } = props;

  return (
    <List sx={{ width: '100%', margin: 'auto', maxWidth: 400, bgcolor: 'background.paper' }}>
      {
        todos.map((t) =>
          <TodoItemComponent
            key={t.id}
            done={t.done}
            id={t.id!}
            title={t.title}
            toggleDone={toggleDone}
          />
        )
      }
    </List>
  );
};

