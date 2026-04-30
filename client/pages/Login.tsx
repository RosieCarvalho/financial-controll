import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await auth.signInWithPassword(email, password);
    setLoading(false);
    if (res.error) {
      alert(res.error.message);
      return;
    }
    navigate("/");
  };

  const handleOAuth = async (provider: string) => {
    try {
      await auth.signInWithOAuth(provider);
    } catch (err: any) {
      alert(err?.message || String(err));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await auth.signUpWithPassword(email, password);
    setLoading(false);
    if (res.error) {
      alert(res.error.message);
      return;
    }
    alert(
      "Conta criada. Verifique seu email para confirmar (se aplicável). Faça login.",
    );
    setIsRegister(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-3 rounded-full shadow-md">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-primary">
            FinControl
          </span>
        </div>

        <div className="w-full max-w-md md:max-w-lg p-6 rounded-lg border bg-card/60">
          <h2 className="text-2xl font-bold mb-4">Entrar</h2>
          <form
            onSubmit={isRegister ? handleRegister : handlePasswordLogin}
            className="space-y-4"
          >
            <div>
              <label className="text-sm block mb-1">Email</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-sm block mb-1">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {isRegister ? "Criar conta" : "Entrar"}
            </Button>
          </form>

          <div className="my-4 text-center text-sm text-muted-foreground">
            ou
          </div>

          <div className="flex gap-2">
            <Button className="w-full" onClick={() => handleOAuth("google")}>
              Entrar com Google
            </Button>
          </div>

          <div className="mt-4 text-center text-sm">
            {isRegister ? (
              <>
                Já tem uma conta?{" "}
                <button
                  className="text-primary underline"
                  onClick={() => setIsRegister(false)}
                >
                  Entrar
                </button>
              </>
            ) : (
              <>
                Não tem conta?{" "}
                <button
                  className="text-primary underline"
                  onClick={() => setIsRegister(true)}
                >
                  Criar conta
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
