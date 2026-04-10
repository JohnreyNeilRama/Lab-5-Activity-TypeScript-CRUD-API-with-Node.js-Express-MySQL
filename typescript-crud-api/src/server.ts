// src/server.ts
import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './_middleware/errorHandler';
import { initialize } from './helpers/db';
import usersController from './users/users.controller';
import departmentsController from './users/departments.controller';
import employeesController from './users/employees.controller';
import requestsController from './users/requests.controller';
import authController from './users/auth.controller';
import seedController from './users/seed.controller';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// API Routes (must come BEFORE static files)
app.use('/auth', authController);
app.use('/seed', seedController);
app.use('/users', usersController);
app.use('/departments', departmentsController);
app.use('/employees', employeesController);
app.use('/requests', requestsController);

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Global Error Handler (must be last)
app.use(errorHandler);

// Start server + initialize database
const PORT = process.env.PORT || 4000;

initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`🧪 API Endpoints:`);
      console.log(`   - Auth:       http://localhost:${PORT}/auth/login`);
      console.log(`   - Users:      http://localhost:${PORT}/users`);
      console.log(`   - Departments: http://localhost:${PORT}/departments`);
      console.log(`   - Employees:  http://localhost:${PORT}/employees`);
      console.log(`   - Requests:   http://localhost:${PORT}/requests`);
      console.log(`🌐 Frontend: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  });