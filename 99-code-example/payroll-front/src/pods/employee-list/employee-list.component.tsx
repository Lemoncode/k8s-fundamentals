import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Employee } from './employee-list.vm';

interface Props {
  employeeList: Employee[];
}

export const EmployeeListComponent: React.FunctionComponent<Props> = ({
  employeeList,
}) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell align="left">Name</TableCell>
            <TableCell align="left">User Name</TableCell>
            <TableCell align="left">Email</TableCell>
            <TableCell align="right">Phone</TableCell>
            <TableCell align="right">Address</TableCell>
            <TableCell align="left">Department</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employeeList.map((employee) => (
            <TableRow key={employee.phone}>
              <TableCell align="left">{employee.name}</TableCell>
              <TableCell align="left">{employee.username}</TableCell>
              <TableCell align="left">{employee.email}</TableCell>
              <TableCell align="right">{employee.phone}</TableCell>
              <TableCell align="right">{employee.address.street}</TableCell>
              <TableCell align="left">{employee.company.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
