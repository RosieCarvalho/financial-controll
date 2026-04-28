import { TransactionBD } from "@shared/api";
import axios from "axios";

const BASE_URL = (import.meta.env.VITE_API_URL as string) || "/";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Response interceptor: unwrap `data` and normalize errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error?.response?.data || error?.message || String(error);
    return Promise.reject(new Error(message));
  },
);

export const getDashboard = () => api.get("/api/dashboard");
export const getCartoes = () => api.get("/api/cartoes");
export const getCartao = (id: string) => api.get(`/api/cartoes/${id}`);
export const getTransacoes = () => api.get("/api/transactions");
export const getPlanosFuturos = () => api.get("/api/planos_futuros");
export const getCategorias = () => api.get("/api/categorias");
export const getCaixas = () => api.get("/api/caixas");
export const getTypesStatusTransaction = () =>
  api.get("/api/transactions/types-status");

export const createCaixa = (payload: any) => api.post("/api/caixas", payload);
export const getHistoricoCaixa = (id: string) =>
  api.get(`/api/caixas/${id}/historico`);
export const createHistoricoCaixa = (id: string, payload: any) =>
  api.post(`/api/caixas/${id}/historico`, payload);
export const createPlanoFuturo = (payload: any) =>
  api.post("/api/planos_futuros", payload);
export const getComprasTerceiros = () => api.get("/api/compras_terceiros");

export const createTransaction = (payload: any) =>
  api.post("/api/transactions", payload);

export const updateTransaction = (payload: TransactionBD) =>
  api.put(`/api/transactions`, payload);
export const createCategoria = (payload: any) =>
  api.post("/api/categorias", payload);
export const updateCategoria = (id: string, payload: any) =>
  api.put(`/api/categorias/${id}`, payload);
export const deleteCategoria = (id: string) =>
  api.delete(`/api/categorias/${id}`);

export const createCartao = (payload: any) => api.post("/api/cartoes", payload);
export const updateCartao = (id: string, payload: any) =>
  api.put(`/api/cartoes/${id}`, payload);
export const deleteCartao = (id: string) => api.delete(`/api/cartoes/${id}`);
export const createCompraTerceiro = (payload: any) =>
  api.post("/api/compras_terceiros", payload);

export const receiveCompraTerceiro = (id: any) => {
  return api.patch(`/api/compras_terceiros/${id}/receive`);
};
export const updateCompraTerceiro = (id: string, payload: any) =>
  api.put(`/api/compras_terceiros/${id}`, payload);
export const deleteCompraTerceiro = (id: string) =>
  api.delete(`/api/compras_terceiros/${id}`);
export const deleteTransaction = (id: string) =>
  api.delete(`/api/transactions/${id}`);

export const getFaturaCartao = (id: string) =>
  api.get(`/api/cartoes/${id}/fatura`);
