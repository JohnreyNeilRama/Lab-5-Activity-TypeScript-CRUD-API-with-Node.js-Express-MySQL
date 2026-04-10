"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("./_middleware/errorHandler");
const db_1 = require("./helpers/db");
const users_controller_1 = __importDefault(require("./users/users.controller"));
const departments_controller_1 = __importDefault(require("./users/departments.controller"));
const employees_controller_1 = __importDefault(require("./users/employees.controller"));
const requests_controller_1 = __importDefault(require("./users/requests.controller"));
const auth_controller_1 = __importDefault(require("./users/auth.controller"));
const seed_controller_1 = __importDefault(require("./users/seed.controller"));
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
// API Routes (must come BEFORE static files)
app.use('/auth', auth_controller_1.default);
app.use('/seed', seed_controller_1.default);
app.use('/users', users_controller_1.default);
app.use('/departments', departments_controller_1.default);
app.use('/employees', employees_controller_1.default);
app.use('/requests', requests_controller_1.default);
// Serve static files from frontend folder
app.use(express_1.default.static(path_1.default.join(__dirname, '../frontend')));
// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../frontend/index.html'));
});
// Global Error Handler (must be last)
app.use(errorHandler_1.errorHandler);
// Start server + initialize database
const PORT = process.env.PORT || 4000;
(0, db_1.initialize)()
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
