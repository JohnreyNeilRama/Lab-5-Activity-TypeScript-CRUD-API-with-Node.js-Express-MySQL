"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestService = void 0;
// src/users/request.service.ts
const db_1 = require("../helpers/db");
exports.requestService = {
    getAll,
    getAllByUser,
    getById,
    create,
    updateStatus,
    delete: _delete,
};
async function getAll() {
    return await db_1.db.Request.findAll({ order: [['createdAt', 'DESC']] });
}
async function getAllByUser(email) {
    return await db_1.db.Request.findAll({
        where: { employeeEmail: email },
        order: [['createdAt', 'DESC']]
    });
}
async function getById(id) {
    const request = await db_1.db.Request.findByPk(id);
    if (!request) {
        throw new Error('Request not found');
    }
    return request;
}
async function create(params) {
    await db_1.db.Request.create(params);
}
async function updateStatus(id, status) {
    const request = await getById(id);
    await request.update({ status });
}
async function _delete(id) {
    const request = await getById(id);
    await request.destroy();
}
