"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TYPES = exports.container = void 0;
const inversify_1 = require("inversify");
const client_1 = require("@app/storage/mysql/client");
const TYPES = { MySQLClient: Symbol.for('MySQLClient') };
exports.TYPES = TYPES;
Object.seal(TYPES);
const container = new inversify_1.Container();
exports.container = container;
container.bind(TYPES.MySQLClient).to(client_1.MySQLClient);
Object.seal(container);
//# sourceMappingURL=container.js.map