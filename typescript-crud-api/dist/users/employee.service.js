"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeService = void 0;
// src/users/employee.service.ts
const db_1 = require("../helpers/db");
exports.employeeService = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
};
async function getAll() {
    return await db_1.db.Employee.findAll({ order: [['id', 'ASC']] });
}
async function getById(id) {
    const employee = await db_1.db.Employee.findByPk(id);
    if (!employee) {
        throw new Error('Employee not found');
    }
    return employee;
}
async function create(params) {
    const user = await db_1.db.User.findOne({ where: { email: params.email } });
    if (!user) {
        throw new Error('User with this email does not exist');
    }
    await db_1.db.Employee.create(params);
}
async function update(id, params) {
    const employee = await getById(id);
    if (params.email && params.email !== employee.email) {
        const user = await db_1.db.User.findOne({ where: { email: params.email } });
        if (!user) {
            throw new Error('User with this email does not exist');
        }
    }
    await employee.update(params);
}
async function _delete(id) {
    const employee = await getById(id);
    await employee.destroy();
}
