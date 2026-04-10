"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentService = void 0;
// src/users/department.service.ts
const db_1 = require("../helpers/db");
exports.departmentService = {
    getAll,
    getById,
    create,
    update,
    delete: _delete,
};
async function getAll() {
    return await db_1.db.Department.findAll({ order: [['name', 'ASC']] });
}
async function getById(id) {
    const department = await db_1.db.Department.findByPk(id);
    if (!department) {
        throw new Error('Department not found');
    }
    return department;
}
async function create(params) {
    const existing = await db_1.db.Department.findOne({ where: { name: params.name } });
    if (existing) {
        throw new Error(`Department "${params.name}" already exists`);
    }
    await db_1.db.Department.create(params);
}
async function update(id, params) {
    const department = await getById(id);
    if (params.name && params.name !== department.name) {
        const existing = await db_1.db.Department.findOne({ where: { name: params.name } });
        if (existing) {
            throw new Error(`Department "${params.name}" already exists`);
        }
    }
    await department.update(params);
}
async function _delete(id) {
    const department = await getById(id);
    await department.destroy();
}
