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
            <TableCell>Id</TableCell>
            <TableCell align="right">Name</TableCell>
            <TableCell align="right">Lastname</TableCell>
            <TableCell align="right">Email</TableCell>
            <TableCell align="right">Phone</TableCell>
            <TableCell align="right">Address</TableCell>
            <TableCell align="right">Department</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {employeeList.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell component="th" scope="row">
                {employee.firstName}
              </TableCell>
              <TableCell align="right">{employee.id}</TableCell>
              <TableCell align="right">{employee.lastName}</TableCell>
              <TableCell align="right">{employee.email}</TableCell>
              <TableCell align="right">{employee.phone}</TableCell>
              <TableCell align="right">{employee.address}</TableCell>
              <TableCell align="right">{employee.department}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
