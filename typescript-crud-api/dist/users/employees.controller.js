"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const joi_1 = __importDefault(require("joi"));
const validateRequest_1 = require("../_middleware/validateRequest");
const employee_service_1 = require("./employee.service");
const router = (0, express_1.Router)();
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);
exports.default = router;
async function getAll(req, res, next) {
    try {
        const employees = await employee_service_1.employeeService.getAll();
        res.json(employees);
    }
    catch (error) {
        next(error);
    }
}
async function getById(req, res, next) {
    try {
        const employee = await employee_service_1.employeeService.getById(String(req.params.id));
        res.json(employee);
    }
    catch (error) {
        next(error);
    }
}
async function create(req, res, next) {
    try {
        await employee_service_1.employeeService.create(req.body);
        res.json({ message: 'Employee created' });
    }
    catch (error) {
        next(error);
    }
}
async function update(req, res, next) {
    try {
        await employee_service_1.employeeService.update(String(req.params.id), req.body);
        res.json({ message: 'Employee updated' });
    }
    catch (error) {
        next(error);
    }
}
async function _delete(req, res, next) {
    try {
        await employee_service_1.employeeService.delete(String(req.params.id));
        res.json({ message: 'Employee deleted' });
    }
    catch (error) {
        next(error);
    }
}
function createSchema(req, res, next) {
    const schema = joi_1.default.object({
        id: joi_1.default.string().required(),
        email: joi_1.default.string().email().required(),
        position: joi_1.default.string().required(),
        department: joi_1.default.string().required(),
        hireDate: joi_1.default.string().allow(''),
    });
    (0, validateRequest_1.validateRequest)(req, next, schema);
}
function updateSchema(req, res, next) {
    const schema = joi_1.default.object({
        id: joi_1.default.string().empty(''),
        email: joi_1.default.string().email().empty(''),
        position: joi_1.default.string().empty(''),
        department: joi_1.default.string().empty(''),
        hireDate: joi_1.default.string().allow(''),
    });
    (0, validateRequest_1.validateRequest)(req, next, schema);
}
