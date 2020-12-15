"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const utils_1 = __importDefault(require("@app/utils"));
const logger_1 = __importDefault(require("@app/logger"));
const mysql_1 = require("@app/storage/mysql");
logger_1.default.info(utils_1.default.validateEmail('test@test.com'));
logger_1.default.info(utils_1.default.hash('test') === '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08');
const mysql = mysql_1.container.get(mysql_1.TYPES.MySQLClient);
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mysql.connect();
    const conn = yield mysql.getConnection();
    const b = yield conn.query('select * from users');
    console.log(b);
    conn.release();
}))();
//# sourceMappingURL=index.js.map