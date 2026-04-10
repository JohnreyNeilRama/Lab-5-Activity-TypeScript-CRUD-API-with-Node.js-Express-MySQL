"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../helpers/db");
const router = (0, express_1.Router)();
router.get('/', seed);
exports.default = router;
async function seed(req, res, next) {
    try {
        const force = req.query.force === 'true';
        const existingAdmin = await db_1.db.User.findOne({ where: { email: 'admin@example.com' } });
        if (existingAdmin) {
            if (force) {
                await existingAdmin.destroy();
            }
            else {
                res.json({ message: 'Admin already exists', email: existingAdmin.email });
                return;
            }
        }
        const passwordHash = await bcryptjs_1.default.hash('admin123', 10);
        const admin = await db_1.db.User.create({
            title: 'Admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            passwordHash,
            role: 'Admin',
            verified: true
        });
        res.json({
            message: force ? 'Admin password reset' : 'Admin user created',
            email: admin.email,
            password: 'admin123'
        });
    }
    catch (error) {
        next(error);
    }
}
