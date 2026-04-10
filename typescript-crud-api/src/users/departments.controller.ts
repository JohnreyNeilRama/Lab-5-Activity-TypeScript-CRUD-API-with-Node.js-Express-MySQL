// src/users/departments.controller.ts
import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import Joi from 'joi';
import { validateRequest } from '../_middleware/validateRequest';
import { departmentService } from './department.service';

const router = Router();

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);

export default router;

async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const departments = await departmentService.getAll();
    res.json(departments);
  } catch (error) {
    next(error);
  }
}

async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const department = await departmentService.getById(Number(req.params.id));
    res.json(department);
  } catch (error) {
    next(error);
  }
}

async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await departmentService.create(req.body);
    res.json({ message: 'Department created' });
  } catch (error) {
    next(error);
  }
}

async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await departmentService.update(Number(req.params.id), req.body);
    res.json({ message: 'Department updated' });
  } catch (error) {
    next(error);
  }
}

async function _delete(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await departmentService.delete(Number(req.params.id));
    res.json({ message: 'Department deleted' });
  } catch (error) {
    next(error);
  }
}

function createSchema(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function updateSchema(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    name: Joi.string().empty(''),
    description: Joi.string().empty(''),
  });
  validateRequest(req, next, schema);
}