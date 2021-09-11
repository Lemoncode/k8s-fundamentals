import React from 'react';
import { useHistory } from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Collapse from '@material-ui/core/Collapse';
import { routes } from 'core/router';
import ChartComponent from 'common/components/charts/chart.component';
import { Employee } from './employee.vm';

interface Props {
  employee: Employee;
}

export const EmployeeComponent: React.FunctionComponent<Props> = ({
  employee,
}) => {
  const history = useHistory();
  const handleClick = () => history.push(routes.employeeList);
  const dataChart = employee.payrollInfo.payrollList
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .map((payroll) => ({
      label: `${payroll.date.getMonth()} / ${payroll.date.getFullYear()}`,
      amount: payroll.amount,
    }));
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={handleClick}>
            Return Employee List
          </Button>
        </Toolbar>
      </AppBar>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h5" component="h2">
            {`${employee.id} ${employee.name} ${employee.username}`}
          </Typography>
          <Typography color="textSecondary">
            {employee.address.street}
          </Typography>
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
          <IconButton
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
          >
            Show payrolls <ExpandMoreIcon />
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

      <ChartComponent
        dataChart={dataChart}
        title={`${employee.name} ${employee.username}`}
      />
    </>
  );
};
