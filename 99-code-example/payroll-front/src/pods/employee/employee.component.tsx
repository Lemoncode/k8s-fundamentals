import React from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Employee } from './employee.vm';

interface Props {
  employee: Employee;
}

export const EmployeeComponent: React.FunctionComponent<Props> = ({
  employee,
}) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5" component="h2">
          {`${employee.id} ${employee.name} ${employee.username}`}
        </Typography>
        <Typography color="textSecondary">{employee.address.street}</Typography>
        <Typography variant="body2" component="p">
          {employee.company.name}
        </Typography>
        <Typography variant="body2" component="p">
          {employee.email}
        </Typography>
        <Typography variant="body2" component="p">
          {employee.phone}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary">
          Show chart
        </Button>
      </CardActions>
    </Card>
  );
};
