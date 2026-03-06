import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { listTransactions, createTransaction } from "./routes/transactions";
import {
  listCategorias,
  getCategoria,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from "./routes/categorias";
import {
  listCaixas,
  getCaixa,
  createCaixa,
  listHistoricoCaixa,
} from "./routes/caixas";
import { listCartoes, getCartao, createCartao } from "./routes/cartoes";
import {
  listComprasTerceiros,
  createCompraTerceiro,
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

  // Supabase-backed transactions endpoints (expect tables in Supabase with Portuguese names)
  app.get("/api/transactions", listTransactions);
  app.post("/api/transactions", createTransaction);

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

  // Cartões de crédito
  app.get("/api/cartoes", listCartoes);
  app.get("/api/cartoes/:id", getCartao);
  app.post("/api/cartoes", createCartao);

  // Compras de terceiros
  app.get("/api/compras_terceiros", listComprasTerceiros);
  app.post("/api/compras_terceiros", createCompraTerceiro);

  // Planos futuros
  app.get("/api/planos_futuros", listPlanosFuturos);
  app.post("/api/planos_futuros", createPlanoFuturo);

  // Dashboard
  app.get("/api/dashboard", getDashboard);

  return app;
}
