import { Router } from 'express';
import { generateEmployee } from './employee-generator.service';

export const employeeRouter = Router();

employeeRouter.get('/random', (_, res) => {
    const employee = generateEmployee();
    res.send(employee);
});

