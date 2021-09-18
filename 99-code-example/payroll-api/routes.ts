import { Router } from "express";
import { CacheService } from './services/cache.service';
import { employeeList } from "./employee-mock-data";
import { Employee } from './employee.model';

export const employeeRouter = (cacheService?: CacheService) => {
  const router = Router();

  router.get("/", (_, res) => {
    res.send(employeeList);
  });

  const cacheEmployee = async (key: string, employee: Employee | undefined) => {
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
      employee = employeeList.find((e) => e.id === +id);
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

