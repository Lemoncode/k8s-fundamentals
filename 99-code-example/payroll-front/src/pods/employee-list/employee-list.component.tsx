import React from 'react';
import { useHistory } from 'react-router-dom';
import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { routes } from 'core/router';
import { Employee } from './employee-list.vm';

interface Props {
  employeeList: Employee[];
}

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
  })
)(TableCell);

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      cursor: 'pointer',
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
      },
      '&:hover': {
        backgroundColor: 'cyan',
      },
    },
  })
)(TableRow);

export const EmployeeListComponent: React.FunctionComponent<Props> = ({
  employeeList,
}) => {
  const history = useHistory();
  const handleClick = (id: string) => () => history.push(routes.employee(id));

  return (
    <>
      <h1>Employee list</h1>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="left">Name</StyledTableCell>
              <StyledTableCell align="left">User Name</StyledTableCell>
              <StyledTableCell align="left">Email</StyledTableCell>
              <StyledTableCell align="right">Phone</StyledTableCell>
              <StyledTableCell align="right">Address</StyledTableCell>
              <StyledTableCell align="left">Department</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {employeeList.map((employee) => (
              <StyledTableRow
                key={employee.phone}
                onClick={handleClick(employee.id)}
              >
                <StyledTableCell align="left">{employee.name}</StyledTableCell>
                <StyledTableCell align="left">
                  {employee.username}
                </StyledTableCell>
                <StyledTableCell align="left">{employee.email}</StyledTableCell>
                <StyledTableCell align="right">
                  {employee.phone}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {employee.address.street}
                </StyledTableCell>
                <StyledTableCell align="left">
                  {employee.company.name}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
