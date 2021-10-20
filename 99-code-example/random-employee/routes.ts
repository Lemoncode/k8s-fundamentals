import { Router } from 'express';
import { generateEmployee } from './employee-generator.service';
import { FileWriter } from './logger';

export const employeeRouterFactory = (logger: FileWriter) => {
  const employeeRouter = Router();

  employeeRouter.get('/random', async (req, res) => {
    const headers = req.rawHeaders.join('');
    logger.writeToFile(headers);
    const employee = generateEmployee();
    res.send(employee);
  });

  return employeeRouter;

};

