"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const config_1 = __importDefault(require("@app/config"));
const transports = process.env.NODE_ENV === 'production' || config_1.default.app.production
    ? [
        new winston_1.default.transports.File({ filename: 'error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'combined.log' }),
    ]
    : [
        new winston_1.default.transports.Console(),
    ];
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston_1.default.format.combine(winston_1.default.format.label({ label: `${process.env.NODE_ENV ? process.env.NODE_ENV : 'local'}` }), winston_1.default.format.colorize(), winston_1.default.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }), winston_1.default.format.printf((info) => `[${info.label}][${info.timestamp}] ${info.level}: ${info.message}`)),
    transports,
});
exports.default = logger;
//# sourceMappingURL=logger.js.map