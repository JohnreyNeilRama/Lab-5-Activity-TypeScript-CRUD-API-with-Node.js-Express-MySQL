// src/users/auth.controller.ts
import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../helpers/db';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/verify', verify);

export default router;

async function verify(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;

    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await user.update({ verified: true });
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
}

async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await db.User.scope('withHash').findOne({ where: { email } });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

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
  } catch (error) {
    next(error);
  }
}

async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const existing = await db.User.findOne({ where: { email } });
    if (existing) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await db.User.create({
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
  } catch (error) {
    next(error);
  }
}