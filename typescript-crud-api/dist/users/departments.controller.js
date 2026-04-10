"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const joi_1 = __importDefault(require("joi"));
const validateRequest_1 = require("../_middleware/validateRequest");
const department_service_1 = require("./department.service");
const router = (0, express_1.Router)();
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);
exports.default = router;
async function getAll(req, res, next) {
    try {
        const departments = await department_service_1.departmentService.getAll();
        res.json(departments);
    }
    catch (error) {
        next(error);
    }
}
async function getById(req, res, next) {
    try {
        const department = await department_service_1.departmentService.getById(Number(req.params.id));
        res.json(department);
    }
    catch (error) {
        next(error);
    }
}
async function create(req, res, next) {
    try {
        await department_service_1.departmentService.create(req.body);
        res.json({ message: 'Department created' });
    }
    catch (error) {
        next(error);
    }
}
async function update(req, res, next) {
    try {
        await department_service_1.departmentService.update(Number(req.params.id), req.body);
        res.json({ message: 'Department updated' });
    }
    catch (error) {
        next(error);
    }
}
async function _delete(req, res, next) {
    try {
        await department_service_1.departmentService.delete(Number(req.params.id));
        res.json({ message: 'Department deleted' });
    }
    catch (error) {
        next(error);
    }
}
function createSchema(req, res, next) {
    const schema = joi_1.default.object({
        name: joi_1.default.string().required(),
        description: joi_1.default.string().required(),
    });
    (0, validateRequest_1.validateRequest)(req, next, schema);
}
function updateSchema(req, res, next) {
    const schema = joi_1.default.object({
        name: joi_1.default.string().empty(''),
        description: joi_1.default.string().empty(''),
    });
    (0, validateRequest_1.validateRequest)(req, next, schema);
}
