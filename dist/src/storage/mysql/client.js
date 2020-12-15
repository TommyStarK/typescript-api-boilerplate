"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.MySQLClient = void 0;
/* eslint-disable @typescript-eslint/lines-between-class-members */
const inversify_1 = require("inversify");
const promise_1 = __importDefault(require("mysql2/promise"));
// import util from 'util';
const config_1 = __importDefault(require("@app/config"));
const utils_1 = __importDefault(require("@app/utils"));
let MySQLClient = class MySQLClient {
    constructor() {
        this.hydratationPath = 'server/storage/mysql/tables';
    }
    checkConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.getConnection();
            yield connection.ping();
            connection.release();
        });
    }
    checkDatabase() {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.getConnection();
            yield connection.query(`create database if not exists ${config_1.default.mysql.database};`);
            yield connection.query(`use ${config_1.default.mysql.database};`);
            const tables = yield utils_1.default.readdirAsync(this.hydratationPath);
            console.log(tables);
            const promises = tables.map((table) => __awaiter(this, void 0, void 0, function* () {
                const tmp = yield utils_1.default.readFileAsync(`${this.hydratationPath}/${table}`);
                connection.query(tmp.toString('utf-8'));
            }));
            console.log(promises);
            yield Promise.all(promises);
            connection.release();
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.pool !== undefined) {
                yield this.checkConnection();
                return;
            }
            const { host, user, password, } = config_1.default.mysql;
            this.pool = promise_1.default.createPool({
                connectionLimit: 10,
                host,
                user,
                password,
            });
            yield this.checkDatabase();
            yield this.checkConnection();
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.end();
            this.pool = undefined;
        });
    }
    getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = yield this.pool.getConnection();
            return conn;
        });
    }
    query() {
        return this.pool.query;
    }
};
MySQLClient = __decorate([
    inversify_1.injectable()
], MySQLClient);
exports.MySQLClient = MySQLClient;
//# sourceMappingURL=client.js.map