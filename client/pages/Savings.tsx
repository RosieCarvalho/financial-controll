import { useState, useEffect } from "react";
import {
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  History,
  Target,
  Info,
  ChevronRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CashBox } from "@shared/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCaixas, createCaixa } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Caixinhas are fetched from the API; no local mock data.

export default function Savings() {
  const queryClient = useQueryClient();
  const { data: caixasData } = useQuery({
    queryKey: ["caixas"],
    queryFn: getCaixas,
  });
  const [boxes, setBoxes] = useState<CashBox[]>(caixasData ?? []);
  useEffect(() => {
    if (caixasData) setBoxes(caixasData as any);
  }, [caixasData]);
  const createCaixaMutation = useMutation({
    mutationFn: createCaixa,
    onMutate: async (newBox: any) => {
      await queryClient.cancelQueries({ queryKey: ["caixas"] });
      const previous = queryClient.getQueryData(["caixas"]);
      setBoxes((cur) => [...(cur ?? []), newBox]);
      return { previous };
    },
    onError: (err, newBox, context: any) => {
      setBoxes(context?.previous ?? []);
      toast.error("Erro ao criar caixinha.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["caixas"] });
    },
  });
  const [selectedBox, setSelectedBox] = useState<CashBox | null>(null);
  const [isTxDialogOpen, setIsTxDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [txType, setTxType] = useState<"deposit" | "withdrawal">("deposit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleOpenTransaction = (
    box: CashBox,
    type: "deposit" | "withdrawal",
  ) => {
    setSelectedBox(box);
    setTxType(type);
    setAmount("");
    setDescription("");
    setIsTxDialogOpen(true);
  };

  const handleOpenHistory = (box: CashBox) => {
    setSelectedBox(box);
    setIsHistoryDialogOpen(true);
  };

  const handleTransactionSubmit = () => {
    if (!selectedBox || !amount || parseFloat(amount) <= 0) return;

    const numAmount = parseFloat(amount);
    const finalAmount = txType === "deposit" ? numAmount : -numAmount;

    if (txType === "withdrawal" && selectedBox.balance < numAmount) {
      toast.error("Saldo insuficiente na caixinha!");
      return;
    }

    const newHistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      amount: finalAmount,
      date: new Date().toISOString().split("T")[0],
      type: txType,
      description:
        description || (txType === "deposit" ? "Depósito" : "Resgate"),
    };

    const updatedBoxes = boxes.map((b) => {
      if (b.id === selectedBox.id) {
        return {
          ...b,
          balance: b.balance + finalAmount,
          history: [newHistoryItem, ...b.history],
        };
      }
      return b;
    });

    setBoxes(updatedBoxes);
    setIsTxDialogOpen(false);
    toast.success(
      `${txType === "deposit" ? "Depósito" : "Resgate"} realizado com sucesso!`,
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Caixinhas</h1>
          <p className="text-muted-foreground">
            Gerencie seu dinheiro guardado e metas de economia.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Caixinha
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Caixinha</DialogTitle>
              <DialogDescription>
                Defina um nome e um objetivo para seu dinheiro.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Nome da Caixinha</label>
                <Input
                  id="new-box-name"
                  placeholder="Ex: Reforma da Casa, Troca de Carro"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  id="new-box-desc"
                  placeholder="Para que serve esse dinheiro?"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Saldo Inicial (Opcional)
                </label>
                <Input id="new-box-balance" type="number" placeholder="0.00" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancelar</Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  const name =
                    (
                      document.getElementById(
                        "new-box-name",
                      ) as HTMLInputElement
                    )?.value || "Nova Caixinha";
                  const description =
                    (
                      document.getElementById(
                        "new-box-desc",
                      ) as HTMLInputElement
                    )?.value || "";
                  const balance = parseFloat(
                    (
                      document.getElementById(
                        "new-box-balance",
                      ) as HTMLInputElement
                    )?.value || "0",
                  );
                  createCaixaMutation.mutate({ name, description, balance });
                }}
              >
                Criar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {boxes.map((box) => (
          <Card
            key={box.id}
            className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-md overflow-hidden group"
          >
            <div className="h-2 w-full bg-emerald-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <PiggyBank className="h-5 w-5" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground group-hover:text-foreground"
                  onClick={() => handleOpenHistory(box)}
                >
                  <History className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="mt-4">{box.name}</CardTitle>
              <CardDescription className="line-clamp-1">
                {box.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    Saldo Atual
                  </p>
                  <h2 className="text-3xl font-bold text-foreground">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(box.balance)}
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary/80 hover:bg-primary/5 text-xs h-7 gap-1"
                  onClick={() => handleOpenHistory(box)}
                >
                  Ver extrato <ChevronRight className="h-3 w-3" />
                </Button>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Última movimentação
                  </span>
                  <span className="font-medium">{box.history[0]?.date}</span>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50 text-xs flex items-center justify-between group-hover:bg-secondary transition-colors">
                  <span className="truncate flex-1">
                    {box.history[0]?.description}
                  </span>
                  <span
                    className={cn(
                      "font-bold ml-2",
                      box.history[0]?.type === "deposit"
                        ? "text-emerald-600"
                        : "text-rose-600",
                    )}
                  >
                    {box.history[0]?.type === "deposit" ? "+" : ""}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(box.history[0]?.amount)}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-secondary/20 border-t pt-4 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 hover:bg-rose-50 border-rose-100"
                onClick={() => handleOpenTransaction(box, "withdrawal")}
              >
                <ArrowDownRight className="h-4 w-4 text-rose-500" /> Resgatar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 border-emerald-200 hover:bg-emerald-50"
                onClick={() => handleOpenTransaction(box, "deposit")}
              >
                <ArrowUpRight className="h-4 w-4 text-emerald-500" /> Guardar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Transaction Dialog */}
      <Dialog open={isTxDialogOpen} onOpenChange={setIsTxDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {txType === "deposit" ? "Guardar Dinheiro" : "Resgatar Dinheiro"}
            </DialogTitle>
            <DialogDescription>
              {selectedBox?.name} • Saldo:{" "}
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(selectedBox?.balance || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Valor</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="pl-9"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Descrição (Opcional)
              </label>
              <Input
                placeholder="Ex: Aporte mensal, Conserto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setIsTxDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className={cn(
                "text-white shadow-md",
                txType === "deposit"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700",
              )}
              onClick={handleTransactionSubmit}
            >
              Confirmar {txType === "deposit" ? "Depósito" : "Resgate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Movimentações: {selectedBox?.name}
            </DialogTitle>
            <DialogDescription>
              Histórico detalhado de depósitos e resgates.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-3">
            {selectedBox?.history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "p-2 rounded-full",
                      item.type === "deposit"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-rose-100 text-rose-600",
                    )}
                  >
                    {item.type === "deposit" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.description}</p>
                    <p className="text-xs text-muted-foreground">{item.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={cn(
                      "font-bold",
                      item.type === "deposit"
                        ? "text-emerald-600"
                        : "text-rose-600",
                    )}
                  >
                    {item.type === "deposit" ? "+" : ""}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(item.amount)}
                  </p>
                  <Badge
                    variant="outline"
                    className="text-[10px] h-4 py-0 flex items-center gap-1 mt-1"
                  >
                    <CheckCircle2 className="h-2 w-2" /> Efetivado
                  </Badge>
                </div>
              </div>
            ))}
            {(!selectedBox || selectedBox.history.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma movimentação registrada.
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsHistoryDialogOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Por que usar Caixinhas?
          </CardTitle>
          <CardDescription>
            Separar seu dinheiro por objetivos ajuda a manter o foco e evita
            gastos impulsivos.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <div className="p-2 w-fit bg-blue-100 rounded-lg text-blue-600">
              <Target className="h-4 w-4" />
            </div>
            <h4 className="font-bold text-sm">Objetivos Claros</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dê um nome e um propósito para cada centavo guardado. Isso aumenta
              sua motivação.
            </p>
          </div>
          <div className="space-y-2">
            <div className="p-2 w-fit bg-emerald-100 rounded-lg text-emerald-600">
              <History className="h-4 w-4" />
            </div>
            <h4 className="font-bold text-sm">Rastreamento</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Veja exatamente como seu dinheiro está crescendo ao longo do tempo
              com o histórico detalhado.
            </p>
          </div>
          <div className="space-y-2">
            <div className="p-2 w-fit bg-amber-100 rounded-lg text-amber-600">
              <ArrowDownRight className="h-4 w-4" />
            </div>
            <h4 className="font-bold text-sm">Integração</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ao pagar uma despesa, você pode escolher de qual caixinha o
              dinheiro deve sair.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
