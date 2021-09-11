import { Router } from "express";
import { employeeList } from "./employee-mock-data";

export const employeeRouter = Router();

employeeRouter.get("/", (_, res) => {
  res.send(employeeList);
});

employeeRouter.get("/:id", (req, res) => {
  const { id } = req.params;
  const employee = employeeList.find((e) => e.id === +id);
  res.send(employee);
});
