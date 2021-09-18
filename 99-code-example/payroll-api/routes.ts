import { Router } from "express";
import { CacheService } from './services/cache.service';
import { employeeList } from "./employee-mock-data";
import { Employee } from './employee.model';
import { DalService } from './services/dal.service';

export const employeeRouter = (cacheService?: CacheService, dalService?: DalService) => {
  console.log('employee router started');
  const router = Router();

  const retrieveEmployeeList = async () => {
    let result;

    if (dalService) {
      result = await dalService.getEmployees();
    } else {
      result = employeeList;
    }

    return result;
  }

  const retrieveEmployee = async (id: string) => {
    let result;

    if (dalService) {
      result = await dalService.getEmployee(+id);
    } else {
      result = employeeList.find((e) => e.id === +id);
    }

    return result;
  };

  router.get("/", async (_, res) => {
    res.send(await retrieveEmployeeList());
  });

  const cacheEmployee = async (key: string, employee: Employee | undefined | null) => {
    if (cacheService) {
      await cacheService.setValue(key, JSON.stringify(employee));
      console.log('caching value', employee);
    }
  };

  const resolveEmployee = async (id: string) => {
    let employee;
    if (cacheService) {
      employee = await cacheService?.getValue(id);
      console.log('cached value', employee);
    }

    if (!employee) {
      employee = await retrieveEmployee(id);
      await cacheEmployee(id, employee);
    }

    return employee;
  };

  router.get("/:id", async (req, res) => {
    const { id } = req.params;
    const employee = await resolveEmployee(id);
    res.send(employee);
  });

  return router;
};

