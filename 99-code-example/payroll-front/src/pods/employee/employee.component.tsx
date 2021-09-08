import React from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import { Employee } from './employee.vm';

interface Props {
  employee: Employee;
}

export const EmployeeComponent: React.FunctionComponent<Props> = ({
  employee,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

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
        <IconButton
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </IconButton>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        {employee.payrollInfo.payrollList.map((payroll) => (
          <CardContent key={payroll.id}>
            <Typography variant="h5" component="h2">
              {payroll.id}
            </Typography>
            <Typography color="textSecondary">
              {payroll.date.toString()}
            </Typography>
            <Typography variant="body2" component="p">
              {payroll.type}
            </Typography>
            <Typography variant="body2" component="p">
              {payroll.cost}
            </Typography>
            <Typography variant="body2" component="p">
              {payroll.amount}
            </Typography>
            <Typography variant="body2" component="p">
              {payroll.accrual}
            </Typography>
            <Typography variant="body2" component="p">
              {payroll.withhold}
            </Typography>
          </CardContent>
        ))}
      </Collapse>
    </Card>
  );
};
