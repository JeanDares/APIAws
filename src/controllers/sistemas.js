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
Object.defineProperty(exports, "__esModule", { value: true });
const connection_1 = require("../db/connection");
class SistemaController {
    listar(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Obter os dados enviados no corpo da solicitação POST
                const requestData = req.body;
                // Aqui você pode processar os dados, se necessário
                const [systemsData, flds] = yield (0, connection_1.filtraTabela)('SELECT s.*, v.versao AS versaoFTP, v.FTPEm ' +
                    'FROM sistemas s ' +
                    'LEFT JOIN versao v ' +
                    'ON (s.id = v.id OR v.id = "*") ' +
                    'AND s.sigla = v.sigla ');
                res.json(systemsData);
            }
            catch (error) {
                console.error('Erro ao obter os dados do banco de dados:', error);
                res.status(500).json({ error: 'Erro interno do servidor' });
            }
        });
    }
    setMensalidade(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.body);
                const { mensalidade, id, sigla } = req.body;
                const con = (0, connection_1.getConnection)();
                const systemsData = yield (0, connection_1.executaSql)('UPDATE sistemas SET mensalidade=? WHERE id=? AND sigla=?', con, [mensalidade, id, sigla]);
                console.log(systemsData);
                if (systemsData.affectedRows > 0) {
                    res.status(200).json({ status: true, mensagem: "Mensalidade atualizada com sucesso" });
                }
                else {
                    res.status(404).json({ status: false, mensagem: "Falha ao atualizar a mensalidade" });
                }
            }
            catch (error) {
                console.error('Erro ao atualizar mensalidade do sistema:', error);
                res.status(500).json({ error: 'Erro interno do servidor' });
            }
        });
    }
    deletarSistema(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(req.body);
                const { id, sigla } = req.body;
                const con = (0, connection_1.getConnection)();
                const systemsData = yield (0, connection_1.executaSql)('DELETE FROM sistemas WHERE id=? AND sigla=?', con, [id, sigla]);
                if (systemsData.affectedRows > 0) {
                    res.status(200).json({ status: true, mensagem: "Sistema deletado com sucesso" });
                }
                else {
                    res.status(500).json({ status: false, mensagem: "Falha ao deletar o sistema" });
                }
            }
            catch (error) {
                console.error('Erro ao deletar sistema:', error);
                res.status(500).json({ error: 'Erro interno do servidor' });
            }
        });
    }
    setVersao(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, base, nome, versao, telefone, pacotes, sigla, info } = req.body;
                const con = (0, connection_1.getConnection)();
                console.log(req.body);
                // Verificar se o sistema já existe
                const consulta = 'SELECT COUNT(*) qtd, atualizadoEm FROM sistemas WHERE id = ? AND sigla = ? AND base = ?';
                const [sistema] = yield (0, connection_1.filtraTabela)(consulta, con, [id, sigla, base]);
                if (Array.isArray(sistema) && sistema.length > 0 && 'qtd' in sistema[0]) {
                    if (sistema[0].qtd > 0) {
                        const atualizadoEm = sistema[0].atualizadoEm;
                        // Verificar se o campo atualizadoEm está em branco e preencher com a data atual
                        if (!atualizadoEm) {
                            const atualizaDataConsulta = 'UPDATE sistemas SET atualizadoEm = now() WHERE id = ? AND sigla = ? AND base = ?';
                            yield (0, connection_1.executaSql)(atualizaDataConsulta, con, [id, sigla, base]);
                        }
                        // Atualizar os outros dados do sistema existente
                        const atualizaConsulta = 'UPDATE sistemas SET acessadoEm = now(), nome = ?, versao = ?, telefone = ?, pacotes = ?, info = ? WHERE id = ? AND sigla = ? AND base = ?';
                        const resultado = yield (0, connection_1.executaSql)(atualizaConsulta, con, [nome, versao, telefone, pacotes, info, id, sigla, base]);
                        if (resultado.affectedRows > 0) {
                            res.status(200).json({ status: true, mensagem: "Dados do sistema atualizados com sucesso" });
                        }
                        else {
                            res.status(404).json({ status: false, mensagem: "Falha ao atualizar os dados do sistema" });
                        }
                    }
                    else {
                        // Criar um novo registro
                        const insereConsulta = 'INSERT INTO sistemas (acessadoEm, atualizadoEm, id, base, nome, versao, telefone, pacotes, sigla, info) VALUES (now(), now(), ?, ?, ?, ?, ?, ?, ?, ?)';
                        const novaConsulta = yield (0, connection_1.executaSql)(insereConsulta, con, [id, base, nome, versao, telefone, pacotes, sigla, info]);
                        if (novaConsulta.affectedRows > 0) {
                            res.status(200).json({ status: true, mensagem: "Novo sistema criado com sucesso" });
                        }
                        else {
                            res.status(500).json({ status: false, mensagem: "Falha ao criar novo sistema" });
                        }
                    }
                }
            }
            catch (error) {
                console.error('Erro ao atualizar ou criar sistema:', error);
                res.status(500).json({ error: 'Erro interno do servidor' });
            }
        });
    }
    liberaVersao(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, sigla, versao, notificar, notificarCNPJ, descritivo } = req.body;
                const con = (0, connection_1.getConnection)();
                // Verificar se o sistema já existe na tabela versao
                const sistemaExisteQuery = 'SELECT COUNT(*) AS qtd FROM versao WHERE id = ? AND sigla = ?';
                const [sistema] = yield (0, connection_1.filtraTabela)(sistemaExisteQuery, con, [id, sigla]);
                if (Array.isArray(sistema) && sistema.length > 0 && 'qtd' in sistema[0] && sistema[0].qtd > 0) {
                    // Atualizar o campo FTPEm em sistema existente na tabela versao
                    const atualizaFTPEmQuery = 'UPDATE versao SET FTPEm = NOW() WHERE id = ? AND sigla = ?';
                    const atualizaFTPEm = yield (0, connection_1.executaSql)(atualizaFTPEmQuery, con, [id, sigla]);
                    if (atualizaFTPEm.affectedRows > 0) {
                        // Verificar se descritivo e notificar estão preenchidos
                        if (descritivo.trim() !== '' || notificar.trim() !== '') {
                            // Inserir na tabela historicoversao com os valores fornecidos
                            const insereHistoricoQuery = 'INSERT INTO historicoversao (id, sigla, versao, notificar, notificarCNPJ, descritivo, dataHora) VALUES (?, ?, ?, ?, ?, ?, NOW())';
                            yield (0, connection_1.executaSql)(insereHistoricoQuery, con, [id, sigla, versao, notificar, notificarCNPJ, descritivo]);
                        }
                        res.status(200).json({ status: true, mensagem: "Sistema atualizado com sucesso" });
                    }
                    else {
                        res.status(500).json({ status: false, mensagem: "Falha ao atualizar o sistema" });
                    }
                }
                else {
                    // Inserir novo sistema na tabela versao
                    const insereSistemaQuery = 'INSERT INTO versao (id, sigla, versao, FTPEm) VALUES (?, ?, ?, NOW())';
                    const insereSistema = yield (0, connection_1.executaSql)(insereSistemaQuery, con, [id, sigla, versao]);
                    if (insereSistema.affectedRows > 0) {
                        // Verificar se descritivo e notificar estão preenchidos
                        if (descritivo.trim() !== '' || notificar.trim() !== '') {
                            // Inserir na tabela historicoversao com os valores fornecidos
                            const insereHistoricoQuery = 'INSERT INTO historicoversao (id, sigla, versao, notificar, notificarCNPJ, descritivo, dataHora) VALUES (?, ?, ?, ?, ?, ?, NOW())';
                            yield (0, connection_1.executaSql)(insereHistoricoQuery, con, [id, sigla, versao, notificar, notificarCNPJ, descritivo]);
                        }
                        res.status(200).json({ status: true, mensagem: "Sistema adicionado com sucesso" });
                    }
                    else {
                        res.status(500).json({ status: false, mensagem: "Falha ao adicionar o sistema" });
                    }
                }
            }
            catch (error) {
                console.error('Erro ao atualizar ou criar sistema:', error);
                res.status(500).json({ error: 'Erro interno do servidor' });
            }
        });
    }
}
exports.default = new SistemaController;
