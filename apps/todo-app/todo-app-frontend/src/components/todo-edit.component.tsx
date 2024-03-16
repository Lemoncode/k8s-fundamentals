import React, { ChangeEventHandler, MouseEventHandler, useState, useEffect } from 'react';
import { TodoItem } from './todo.model';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';

interface Props {
  todo?: TodoItem
  createTodo: (todo: TodoItem) => void;
}

export const TodoEditComponent = (props: Props) => {
  const [titleError, setTitleError] = useState(false);
  const [titleTouched, setTitleTouched] = useState(false);
  const [title, setTitle] = useState('');

  const { createTodo } = props;

  const onTitleChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
    setTitle(event.target.value);
    setTitleTouched(true);
  };

  const isEmpty = (value: string) => value === null || value === undefined || value === '';

  useEffect(() => {
    if (titleTouched) {
      setTitleError(isEmpty(title))
    }
  }, [title]);

  const reset = () => {
    setTitle('');
    setTitleTouched(false);
  };

  const handleCreateTodo = (title) => () => {
    const newTodo: TodoItem = {
      title,
      done: false,
    };
    createTodo(newTodo);
    reset();
  };

  return (
    <div style={{ margin: 'auto', paddingBottom: 64, paddingTop: 16 }}>
      <InputLabel>Todo Title</InputLabel>
      <Input error={titleError} onChange={onTitleChange} value={title} />
      <Button style={{ marginLeft: 16 }} onClick={handleCreateTodo(title)} disabled={titleError || !titleTouched} variant="contained">Save</Button>
    </div>
  );
}