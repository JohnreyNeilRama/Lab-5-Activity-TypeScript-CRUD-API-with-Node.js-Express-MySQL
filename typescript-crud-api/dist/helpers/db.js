"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initialize = initialize;
// src/_helpers/db.ts
const config_json_1 = __importDefault(require("../../config.json"));
const promise_1 = __importDefault(require("mysql2/promise"));
const sequelize_1 = require("sequelize");
exports.db = {};
async function initialize() {
    const { host, port, user, password, database } = config_json_1.default.database;
    // Create database if it doesn't exist
    const connection = await promise_1.default.createConnection({ host, port, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();
    // Connect to database with Sequelize
    const sequelize = new sequelize_1.Sequelize(database, user, password, { dialect: 'mysql' });
    // Initialize models
    const { default: userModel } = await Promise.resolve().then(() => __importStar(require('../users/user.model')));
    const { default: departmentModel } = await Promise.resolve().then(() => __importStar(require('../users/department.model')));
    const { default: employeeModel } = await Promise.resolve().then(() => __importStar(require('../users/employee.model')));
    const { default: requestModel } = await Promise.resolve().then(() => __importStar(require('../users/request.model')));
    exports.db.User = userModel(sequelize);
    exports.db.Department = departmentModel(sequelize);
    exports.db.Employee = employeeModel(sequelize);
    exports.db.Request = requestModel(sequelize);
    // Sync models with database
    await sequelize.sync({ alter: true });
    console.log('✅ Database initialized and models synced');
}
