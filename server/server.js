"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const demo_1 = require("./src/routes/demo");
const transactions_1 = require("./src/routes/transactions");
const categorias_1 = require("./src/routes/categorias");
const auth_1 = require("./src/middleware/auth");
const caixas_1 = require("./src/routes/caixas");
const cartoes_1 = require("./src/routes/cartoes");
const compras_terceiros_1 = require("./src/routes/compras_terceiros");
const planos_futuros_1 = require("./src/routes/planos_futuros");
const dashboard_1 = require("./src/routes/dashboard");
function createServer() {
    const app = (0, express_1.default)();
    // Middleware
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // Example API routes
    app.get("/api/ping", (_req, res) => {
        const ping = process.env.PING_MESSAGE ?? "ping";
        res.json({ message: ping });
    });
    app.listen(3000, () => {
        console.log("Servidor rodando na porta 3000");
    });
    app.get("/api/demo", demo_1.handleDemo);
    // Protect subsequent API routes: require Authorization Bearer token
    app.use("/api", auth_1.authMiddleware);
    // Supabase-backed transactions endpoints (expect tables in Supabase with Portuguese names)
    app.get("/api/transactions", transactions_1.listTransactions);
    app.post("/api/transactions", transactions_1.createTransaction);
    app.delete("/api/transactions/:id", transactions_1.deleteTransaction);
    app.get("/api/getTypesStatus", transactions_1.getTypesStatusTransaction);
    app.put("/api/transactions", transactions_1.updateTransactions);
    // Categorias
    app.get("/api/categorias", categorias_1.listCategorias);
    app.get("/api/categorias/:id", categorias_1.getCategoria);
    app.post("/api/categorias", categorias_1.createCategoria);
    app.put("/api/categorias/:id", categorias_1.updateCategoria);
    app.delete("/api/categorias/:id", categorias_1.deleteCategoria);
    // Caixas e histórico
    app.get("/api/caixas", caixas_1.listCaixas);
    app.get("/api/caixas/:id", caixas_1.getCaixa);
    app.post("/api/caixas", caixas_1.createCaixa);
    app.get("/api/caixas/:id/historico", caixas_1.listHistoricoCaixa);
    app.post("/api/caixas/:id/historico", caixas_1.createHistoricoCaixa);
    // Cartões de crédito
    app.get("/api/cartoes", cartoes_1.listCartoes);
    app.get("/api/cartoes/:id", cartoes_1.getCartao);
    app.post("/api/cartoes", cartoes_1.createCartao);
    app.put("/api/cartoes/:id", cartoes_1.updateCartao);
    app.delete("/api/cartoes/:id", cartoes_1.deleteCartao);
    app.get("/api/cartoes/:id/fatura", cartoes_1.listarFaturaCartao);
    // Compras de terceiros
    app.get("/api/compras_terceiros", compras_terceiros_1.listComprasTerceiros);
    app.patch("/api/compras_terceiros/:id/receive", compras_terceiros_1.receiveCompraTerceiro);
    app.post("/api/compras_terceiros", compras_terceiros_1.createCompraTerceiro);
    app.put("/api/compras_terceiros/:id", compras_terceiros_1.updateCompraTerceiro);
    app.delete("/api/compras_terceiros/:id", compras_terceiros_1.deleteCompraTerceiro);
    // Planos futuros
    app.get("/api/planos_futuros", planos_futuros_1.listPlanosFuturos);
    app.post("/api/planos_futuros", planos_futuros_1.createPlanoFuturo);
    // Dashboard
    app.get("/api/dashboard", dashboard_1.getDashboard);
    return app;
}
