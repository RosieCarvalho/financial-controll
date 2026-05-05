import { useState, useEffect } from "react";
import {
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
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
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { CashBox } from "@shared/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCaixas,
  createCaixa,
  getHistoricoCaixa,
  createHistoricoCaixa,
} from "@/src/lib/api";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";
import { NewCashBoxDialog } from "./components/NewCashBoxDialog";
import { CashBoxTransactionDialog } from "./components/CashBoxTransactionDialog";
import { CashBoxHistoryDialog } from "./components/CashBoxHistoryDialog";

export default function Savings() {
  const queryClient = useQueryClient();

  // Queries
  const { data: caixasData = [] } = useQuery({
    queryKey: ["caixas"],
    queryFn: getCaixas,
  });

  const [caixas, setCaixas] = useState<CashBox[]>([]);
  useEffect(() => {
    if (caixasData) setCaixas(caixasData as CashBox[]);
  }, [caixasData]);

  // State
  const [selectedBox, setSelectedBox] = useState<CashBox | null>(null);
  const [isTxDialogOpen, setIsTxDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [txType, setTxType] = useState<"deposit" | "withdrawal">("deposit");

  // Mutations
  const createCaixaMutation = useMutation({
    mutationFn: createCaixa,
    onSuccess: () => {
      toast.success("Caixinha criada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["caixas"] });
    },
    onError: () => {
      toast.error("Erro ao criar caixinha.");
    },
  });

  // Handle create cash box
  const handleCreateCaixa = (box: {
    nome: string;
    descricao: string;
    saldo: number;
  }) => {
    createCaixaMutation.mutate(box);
  };

  // Handle transaction
  const handleOpenTransaction = (
    box: CashBox,
    type: "deposit" | "withdrawal",
  ) => {
    setSelectedBox(box);
    setTxType(type);
    setIsTxDialogOpen(true);
  };

  // Handle transaction submit
  const handleTransactionSubmit = async (
    amount: number,
    description: string,
  ) => {
    if (!selectedBox) return;

    try {
      const resp: any = await createHistoricoCaixa(selectedBox.id, {
        valor: amount,
        descricao: description,
        tipo: txType,
      });

      // Update local selected box with new saldo and history if returned
      if (resp?.caixa) {
        const caixa = resp.caixa;
        const history =
          caixa.historico_caixa ?? caixa.history ?? selectedBox.history;
        setSelectedBox({ ...selectedBox, saldo: caixa.saldo, history });
      }

      toast.success(
        `${txType === "deposit" ? "Depósito" : "Resgate"} de R$ ${amount.toFixed(2)} realizado!`,
      );

      setIsTxDialogOpen(false);
      // Refresh caixas and history
      queryClient.invalidateQueries({ queryKey: ["caixas"] });
      queryClient.invalidateQueries({
        queryKey: ["caixas", selectedBox.id, "historico"],
      });
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao registrar transação");
    }
  };

  // Handle open history
  const handleOpenHistory = (box: CashBox) => {
    // Fetch history for this caixa and attach to selectedBox
    getHistoricoCaixa(box.id)
      .then((hist: any) => {
        setSelectedBox({ ...box, history: hist });
        setIsHistoryDialogOpen(true);
      })
      .catch(() => {
        // fallback: open dialog without history
        setSelectedBox(box);
        setIsHistoryDialogOpen(true);
      });
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
        <NewCashBoxDialog onSubmit={handleCreateCaixa} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {caixas.map((box) => (
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
              <CardTitle className="mt-4">{box.nome}</CardTitle>
              <CardDescription className="line-clamp-1">
                {box.descricao}
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
                    }).format(box.saldo)}
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
                  <span className="font-medium">
                    {box.history?.[0]?.data || "-"}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50 text-xs flex items-center justify-between group-hover:bg-secondary transition-colors">
                  <span className="truncate flex-1">
                    {box.history?.[0]?.descricao || "Nenhuma movimentação"}
                  </span>
                  {box.history?.[0] && (
                    <span
                      className={cn(
                        "font-bold ml-2",
                        box.history[0]?.tipo === "deposit"
                          ? "text-emerald-600"
                          : "text-rose-600",
                      )}
                    >
                      {box.history[0]?.tipo === "deposit" ? "+" : ""}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(box.history[0]?.valor)}
                    </span>
                  )}
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

      {/* Dialogs */}
      <CashBoxTransactionDialog
        isOpen={isTxDialogOpen}
        onOpenChange={setIsTxDialogOpen}
        selectedBox={selectedBox}
        txType={txType}
        onSubmit={handleTransactionSubmit}
      />

      <CashBoxHistoryDialog
        isOpen={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        selectedBox={selectedBox}
      />

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
