// src/users/request.service.ts
import { db } from '../helpers/db';
import { Request, RequestCreationAttributes } from './request.model';

export const requestService = {
  getAll,
  getAllByUser,
  getById,
  create,
  updateStatus,
  delete: _delete,
};

async function getAll(): Promise<Request[]> {
  return await db.Request.findAll({ order: [['createdAt', 'DESC']] });
}

async function getAllByUser(email: string): Promise<Request[]> {
  return await db.Request.findAll({ 
    where: { employeeEmail: email },
    order: [['createdAt', 'DESC']] 
  });
}

async function getById(id: number): Promise<Request> {
  const request = await db.Request.findByPk(id);
  if (!request) {
    throw new Error('Request not found');
  }
  return request;
}

async function create(params: RequestCreationAttributes): Promise<void> {
  await db.Request.create(params);
}

async function updateStatus(id: number, status: string): Promise<void> {
  const request = await getById(id);
  await request.update({ status });
}

async function _delete(id: number): Promise<void> {
  const request = await getById(id);
  await request.destroy();
}