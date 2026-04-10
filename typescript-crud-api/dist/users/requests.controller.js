"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const joi_1 = __importDefault(require("joi"));
const validateRequest_1 = require("../_middleware/validateRequest");
const request_service_1 = require("./request.service");
const router = (0, express_1.Router)();
router.get('/', getAll);
router.get('/user/:email', getAllByUser);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id/status', updateStatusSchema, updateStatus);
router.delete('/:id', _delete);
exports.default = router;
async function getAll(req, res, next) {
    try {
        const requests = await request_service_1.requestService.getAll();
        res.json(requests);
    }
    catch (error) {
        next(error);
    }
}
async function getAllByUser(req, res, next) {
    try {
        const requests = await request_service_1.requestService.getAllByUser(String(req.params.email));
        res.json(requests);
    }
    catch (error) {
        next(error);
    }
}
async function getById(req, res, next) {
    try {
        const request = await request_service_1.requestService.getById(Number(req.params.id));
        res.json(request);
    }
    catch (error) {
        next(error);
    }
}
async function create(req, res, next) {
    try {
        await request_service_1.requestService.create(req.body);
        res.json({ message: 'Request created' });
    }
    catch (error) {
        next(error);
    }
}
async function updateStatus(req, res, next) {
    try {
        await request_service_1.requestService.updateStatus(Number(req.params.id), req.body.status);
        res.json({ message: 'Request status updated' });
    }
    catch (error) {
        next(error);
    }
}
async function _delete(req, res, next) {
    try {
        await request_service_1.requestService.delete(Number(req.params.id));
        res.json({ message: 'Request deleted' });
    }
    catch (error) {
        next(error);
    }
}
function createSchema(req, res, next) {
    const schema = joi_1.default.object({
        employeeEmail: joi_1.default.string().email().required(),
        type: joi_1.default.string().required(),
        items: joi_1.default.string().required(),
        status: joi_1.default.string().default('Pending'),
        date: joi_1.default.string().required(),
    });
    (0, validateRequest_1.validateRequest)(req, next, schema);
}
function updateStatusSchema(req, res, next) {
    const schema = joi_1.default.object({
        status: joi_1.default.string().valid('Pending', 'Approved', 'Rejected').required(),
    });
    (0, validateRequest_1.validateRequest)(req, next, schema);
}
