import React, { ChangeEvent } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';

interface Props {
  title: string;
  id: string;
  done: boolean;
  toggleDone: (id: string) => void;
}

export const TodoItemComponent = (props: Props) => {
  const { title, done, id, toggleDone } = props;

  const doToggleDone = (id: string) => (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    toggleDone(id);
  }

  return (
    <ListItem key={id} secondaryAction={
      <Checkbox
        edge="end"
        checked={done}
        onChange={doToggleDone(id)}
      />
    }>
      <ListItemText primary={title} />
    </ListItem>
  );
}