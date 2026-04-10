// src/users/employee.service.ts
import { db } from '../helpers/db';
import { Employee, EmployeeCreationAttributes } from './employee.model';

export const employeeService = {
  getAll,
  getById,
  create,
  update,
  delete: _delete,
};

async function getAll(): Promise<Employee[]> {
  return await db.Employee.findAll({ order: [['id', 'ASC']] });
}

async function getById(id: string): Promise<Employee> {
  const employee = await db.Employee.findByPk(id);
  if (!employee) {
    throw new Error('Employee not found');
  }
  return employee;
}

async function create(params: EmployeeCreationAttributes): Promise<void> {
  const user = await db.User.findOne({ where: { email: params.email } });
  if (!user) {
    throw new Error('User with this email does not exist');
  }
  await db.Employee.create(params);
}

async function update(id: string, params: Partial<EmployeeCreationAttributes>): Promise<void> {
  const employee = await getById(id);
  if (params.email && params.email !== employee.email) {
    const user = await db.User.findOne({ where: { email: params.email } });
    if (!user) {
      throw new Error('User with this email does not exist');
    }
  }
  await employee.update(params);
}

async function _delete(id: string): Promise<void> {
  const employee = await getById(id);
  await employee.destroy();
}