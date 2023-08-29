"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const constantes_1 = require("./constantes");
const sistemas_1 = __importDefault(require("./src/controllers/sistemas"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("./swagger.json"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = constantes_1._WS_PORTA;
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
app.get('/sistemas', sistemas_1.default.listar);
app.post('/setMensalidade', sistemas_1.default.setMensalidade);
app.post('/DeleteSistema', sistemas_1.default.deletarSistema);
app.post('/setVersao', sistemas_1.default.setVersao);
app.post('/liberaVersao', sistemas_1.default.liberaVersao);
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
