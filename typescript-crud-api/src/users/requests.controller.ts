// src/users/requests.controller.ts
import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import Joi from 'joi';
import { validateRequest } from '../_middleware/validateRequest';
import { requestService } from './request.service';

const router = Router();

router.get('/', getAll);
router.get('/user/:email', getAllByUser);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id/status', updateStatusSchema, updateStatus);
router.delete('/:id', _delete);

export default router;

async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const requests = await requestService.getAll();
    res.json(requests);
  } catch (error) {
    next(error);
  }
}

async function getAllByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const requests = await requestService.getAllByUser(String(req.params.email));
    res.json(requests);
  } catch (error) {
    next(error);
  }
}

async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const request = await requestService.getById(Number(req.params.id));
    res.json(request);
  } catch (error) {
    next(error);
  }
}

async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await requestService.create(req.body);
    res.json({ message: 'Request created' });
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await requestService.updateStatus(Number(req.params.id), req.body.status);
    res.json({ message: 'Request status updated' });
  } catch (error) {
    next(error);
  }
}

async function _delete(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await requestService.delete(Number(req.params.id));
    res.json({ message: 'Request deleted' });
  } catch (error) {
    next(error);
  }
}

function createSchema(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    employeeEmail: Joi.string().email().required(),
    type: Joi.string().required(),
    items: Joi.string().required(),
    status: Joi.string().default('Pending'),
    date: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function updateStatusSchema(req: Request, res: Response, next: NextFunction): void {
  const schema = Joi.object({
    status: Joi.string().valid('Pending', 'Approved', 'Rejected').required(),
  });
  validateRequest(req, next, schema);
}