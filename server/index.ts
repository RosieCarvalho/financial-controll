import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  listTransactions,
  createTransaction,
  getTypesStatusTransaction,
  deleteTransaction,
  updateTransactions,
} from "./routes/transactions";
import {
  listCategorias,
  getCategoria,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from "./routes/categorias";
import { authMiddleware } from "./middleware/auth";
import {
  listCaixas,
  getCaixa,
  createCaixa,
  listHistoricoCaixa,
  createHistoricoCaixa,
} from "./routes/caixas";
import {
  listCartoes,
  getCartao,
  createCartao,
  listarFaturaCartao,
  updateCartao,
  deleteCartao,
} from "./routes/cartoes";
import {
  listComprasTerceiros,
  createCompraTerceiro,
  receiveCompraTerceiro,
  updateCompraTerceiro,
  deleteCompraTerceiro,
} from "./routes/compras_terceiros";
import { listPlanosFuturos, createPlanoFuturo } from "./routes/planos_futuros";
import { getDashboard } from "./routes/dashboard";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Protect subsequent API routes: require Authorization Bearer token
  app.use("/api", authMiddleware);

  // Supabase-backed transactions endpoints (expect tables in Supabase with Portuguese names)
  app.get("/api/transactions", listTransactions);
  app.post("/api/transactions", createTransaction);
  app.delete("/api/transactions/:id", deleteTransaction);
  app.get("/api/getTypesStatus", getTypesStatusTransaction);
  app.put("/api/transactions", updateTransactions);

  // Categorias
  app.get("/api/categorias", listCategorias);
  app.get("/api/categorias/:id", getCategoria);
  app.post("/api/categorias", createCategoria);
  app.put("/api/categorias/:id", updateCategoria);
  app.delete("/api/categorias/:id", deleteCategoria);

  // Caixas e histórico
  app.get("/api/caixas", listCaixas);
  app.get("/api/caixas/:id", getCaixa);
  app.post("/api/caixas", createCaixa);
  app.get("/api/caixas/:id/historico", listHistoricoCaixa);
  app.post("/api/caixas/:id/historico", createHistoricoCaixa);

  // Cartões de crédito
  app.get("/api/cartoes", listCartoes);
  app.get("/api/cartoes/:id", getCartao);
  app.post("/api/cartoes", createCartao);
  app.put("/api/cartoes/:id", updateCartao);
  app.delete("/api/cartoes/:id", deleteCartao);
  app.get("/api/cartoes/:id/fatura", listarFaturaCartao);

  // Compras de terceiros
  app.get("/api/compras_terceiros", listComprasTerceiros);
  app.patch("/api/compras_terceiros/:id/receive", receiveCompraTerceiro);
  app.post("/api/compras_terceiros", createCompraTerceiro);
  app.put("/api/compras_terceiros/:id", updateCompraTerceiro);
  app.delete("/api/compras_terceiros/:id", deleteCompraTerceiro);

  // Planos futuros
  app.get("/api/planos_futuros", listPlanosFuturos);
  app.post("/api/planos_futuros", createPlanoFuturo);

  // Dashboard
  app.get("/api/dashboard", getDashboard);

  return app;
}
