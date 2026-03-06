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
export const getTransacoes = () => api.get("/api/transactions");
export const getPlanosFuturos = () => api.get("/api/planos_futuros");
export const getCategorias = () => api.get("/api/categorias");
export const getCaixas = () => api.get("/api/caixas");

export const createTransaction = (payload: any) =>
  api.post("/api/transactions", payload);

export const createCartao = (payload: any) => api.post("/api/cartoes", payload);
export const createCompraTerceiro = (payload: any) =>
  api.post("/api/compras_terceiros", payload);
