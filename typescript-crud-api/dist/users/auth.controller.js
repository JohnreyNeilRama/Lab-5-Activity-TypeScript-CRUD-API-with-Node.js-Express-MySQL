"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../helpers/db");
const router = (0, express_1.Router)();
router.post('/login', login);
router.post('/register', register);
router.post('/verify', verify);
exports.default = router;
async function verify(req, res, next) {
    try {
        const { email } = req.body;
        const user = await db_1.db.User.findOne({ where: { email } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        await user.update({ verified: true });
        res.json({ message: 'Email verified successfully' });
    }
    catch (error) {
        next(error);
    }
}
async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password are required' });
            return;
        }
        const user = await db_1.db.User.scope('withHash').findOne({ where: { email } });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValidPassword) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        if (!user.verified) {
            res.status(401).json({ message: 'Account not verified' });
            return;
        }
        res.json({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            verified: user.verified
        });
    }
    catch (error) {
        next(error);
    }
}
async function register(req, res, next) {
    try {
        const { email, password, firstName, lastName, role } = req.body;
        const existing = await db_1.db.User.findOne({ where: { email } });
        if (existing) {
            res.status(400).json({ message: 'Email already exists' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.db.User.create({
            title: 'User',
            firstName: firstName || 'User',
            lastName: lastName || 'User',
            email,
            passwordHash,
            role: role || 'User',
            verified: false
        });
        res.status(201).json({
            id: user.id,
            email: user.email,
            message: 'User created successfully'
        });
    }
    catch (error) {
        next(error);
    }
}
