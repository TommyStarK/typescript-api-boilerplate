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
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const config_1 = __importDefault(require("@app/config"));
const algorithm = 'aes-256-ctr';
const iv = crypto_1.default.randomBytes(16);
const password = crypto_1.default.createHash('sha256').update(String(config_1.default.app.secret)).digest('base64').substr(0, 32);
// eslint-disable-next-line no-useless-escape
const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const utils = {
    checkStringLengthInBytes: (target) => Buffer.byteLength(target, 'utf8') === 24,
    encodeBase64: (filePath) => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield utils.readFileAsync(filePath);
        return Buffer.from(data).toString('base64');
    }),
    encrypt: (target) => {
        const cipher = crypto_1.default.createCipheriv(algorithm, password, iv);
        let crypted = cipher.update(target, 'utf8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    },
    decrypt: (target) => {
        const decipher = crypto_1.default.createDecipheriv(algorithm, password, iv);
        let dec = decipher.update(target, 'hex', 'utf8');
        dec += decipher.final('utf8');
        return dec;
    },
    hash: (target) => {
        const hash = crypto_1.default.createHash('sha256');
        hash.update(target);
        return hash.digest('hex');
    },
    readdirAsync: (filePath) => new Promise((resolve, reject) => {
        fs_1.default.readdir(filePath, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        });
    }),
    readFileAsync: (filePath) => new Promise((resolve, reject) => {
        fs_1.default.readFile(filePath, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        });
    }),
    unlinkAsync: (filePath) => new Promise((resolve, reject) => {
        fs_1.default.unlink(filePath, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    }),
    writeFileAsync: (filePath, content) => new Promise((resolve, reject) => {
        fs_1.default.writeFile(filePath, content, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    }),
    validateEmail: (email) => re.test(email),
};
exports.default = utils;
//# sourceMappingURL=utils.js.map