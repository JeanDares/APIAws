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
exports.filtraTabela = exports.executaSql = exports.getConnection = void 0;
const mysql2_1 = __importDefault(require("mysql2"));
const constantes_1 = require("../../constantes");
function getConnection(dbConfig = constantes_1._DB_CONFIG) {
    return mysql2_1.default.createConnection(dbConfig);
}
exports.getConnection = getConnection;
function executaSql(cmdSQL, con, params) {
    return __awaiter(this, void 0, void 0, function* () {
        let fechaCon = false;
        if (!con) {
            con = getConnection();
            fechaCon = true;
        }
        const [rows] = yield con.promise().query(cmdSQL, params);
        if (fechaCon)
            con.end();
        return rows;
    });
}
exports.executaSql = executaSql;
function filtraTabela(cmdSQL, con, params) {
    return __awaiter(this, void 0, void 0, function* () {
        let fechaCon = false;
        if (!con) {
            con = getConnection();
            fechaCon = true;
        }
        const rows = yield con.promise().query(cmdSQL, params);
        if (fechaCon)
            con.end();
        return rows;
    });
}
exports.filtraTabela = filtraTabela;
