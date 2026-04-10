// src/users/employees.controller.ts
import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import Joi from 'joi';
import { validateRequest } from '../_middleware/validateRequest';
import { employeeService } from './employee.service';

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);

export default router;

async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const employees = await employeeService.getAll();
    res.json(employees);
  } catch (error) {
    next(error);
  }
}

async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const employee = await employeeService.getById(String(req.params.id));
    res.json(employee);
  } catch (error) {
    next(error);
  }
}

async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await employeeService.create(req.body);
    res.json({ message: 'Employee created' });
  } catch (error) {
    next(error);
  }
}

async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await employeeService.update(String(req.params.id), req.body);
    res.json({ message: 'Employee updated' });
  } catch (error) {
    next(error);
  }
}

async function _delete(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await employeeService.delete(String(req.params.id));
    res.json({ message: 'Employee deleted' });
  } catch (error) {
    next(error);
  }
}

function createSchema(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    id: Joi.string().required(),
    email: Joi.string().email().required(),
    position: Joi.string().required(),
    department: Joi.string().required(),
    hireDate: Joi.string().allow(''),
  });
  validateRequest(req, next, schema);
}

function updateSchema(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    id: Joi.string().empty(''),
    email: Joi.string().email().empty(''),
    position: Joi.string().empty(''),
    department: Joi.string().empty(''),
    hireDate: Joi.string().allow(''),
  });
  validateRequest(req, next, schema);
}