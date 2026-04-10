// src/users/seed.controller.ts
import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../helpers/db';

const router = Router();

router.get('/', seed);

export default router;

async function seed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const force = req.query.force === 'true';
    const existingAdmin = await db.User.findOne({ where: { email: 'admin@example.com' } });
    
    if (existingAdmin) {
      if (force) {
        await existingAdmin.destroy();
      } else {
        res.json({ message: 'Admin already exists', email: existingAdmin.email });
        return;
      }
    }

    const passwordHash = await bcrypt.hash('admin123', 10);

    const admin = await db.User.create({
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
  } catch (error) {
    next(error);
  }
}