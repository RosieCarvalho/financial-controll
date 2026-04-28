import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import {
  Mutation,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getCartoes,
  getTransacoes,
  getFaturaCartao,
  getCartao,
  updateTransaction,
} from "@/lib/api";
import {
  CreditCard,
  ArrowLeft,
  ChevronRight,
  Layers,
  Calendar,
  Plus,
  MoreVertical,
  AlertCircle,
  Clock,
  CheckCircle2,
  Trash2,
  Tag,
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Transaction,
  AccountCard as AccountCardType,
  Card as CardType,
  TransactionBD,
} from "@shared/api";
import { toast } from "sonner";
import { AddBuy } from "./components/AddBuy";
import EditBuy from "./components/EditBuy";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { deleteTransaction } from "@/lib/api";

export default function CardDetails() {
  const { id } = useParams();
  const [editingTransaction, setEditingTransaction] =
    useState<TransactionBD | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showMine, setShowMine] = useState(false);
  const { data: account } = useQuery<{
    data: AccountCardType[];
  }>({
    queryKey: ["fatura_cartao", id],
    queryFn: () => getFaturaCartao(id!),
    enabled: !!id,
  });

  const { data: card } = useQuery<{
    data: CardType;
  }>({
    queryKey: ["cartoes", id],
    queryFn: () => getCartao(id!),
    enabled: !!id,
  });
  console.log("card", card);

  // Derivando valores diretamente da query para evitar estados dessincronizados
  const totalInvoice = (account ?? []).reduce(
    (acc, p) => acc + (p.valor || p.amount || 0),
    0,
  );

  const displayedPurchases = useMemo(() => {
    return (account ?? []).filter((p) =>
      !showMine
        ? true
        : !(p.descricao || "").toLowerCase().startsWith("terceiro:"),
    );
  }, [account, showMine]);

  const displayedTotal = useMemo(() => {
    return (displayedPurchases ?? []).reduce(
      (acc, p) => acc + (p.valor || p.amount || 0),
      0,
    );
  }, [displayedPurchases]);

  const queryClient = useQueryClient();
  const updateTransactions = useMutation({
    mutationFn: (payload: TransactionBD) => updateTransaction(payload),
    onSuccess: (data, variables, context: any) => {
      queryClient.invalidateQueries({ queryKey: ["fatura_cartao", id] });
      queryClient.invalidateQueries({ queryKey: ["transacoes"] });
      toast.success("Fatura atualizadas!");
    },
    onError: (err, newPlan, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(["fatura_cartao", id], context.previous);
      }

      toast.error("Erro ao atualizar transações.");
    },
  });
  const deleteTxnMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fatura_cartao", id] });
      queryClient.invalidateQueries({ queryKey: ["transacoes"] });
    },
    onError: () => toast.error("Erro ao excluir transação"),
  });
  const handlePayInvoice = () => {
    console.log("account", account);
    const newPurchases = account?.map((p) => {
      if (p.status === "paid") return p;
      if (p.tipo === "one-time") return { ...p, status: "paid" };
      const isLastInstallment =
        p.tipo === "installment" && p.parcela_atual === p.parcelas_total;
      if (isLastInstallment) {
        return { ...p, status: "paid" };
      }

      return {
        ...p,
        parcela_atual: p.parcela_atual + 1,
      };
    });

    const result = updateTransactions.mutate(newPurchases);

    toast.success("Fatura paga! Itens liquidados removidos.");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/cards">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div
                className={cn("p-2 rounded-lg text-white shadow-md", card?.cor)}
              >
                <CreditCard className="h-6 w-6" />
              </div>
              {card?.nome}
            </h1>
            <p className="text-muted-foreground">
              Fatura atual com vencimento dia {card?.dia_vencimento}.
            </p>
          </div>
        </div>
        <Button
          onClick={handlePayInvoice}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
        >
          Pagar Fatura Total
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Total da Fatura
            </CardDescription>
            <CardTitle className="text-3xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(card?.total_transacoes || 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Limite Disponível
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-600">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format((card?.limite || 0) - totalInvoice)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Status
            </CardDescription>
            <CardTitle className="text-xl flex items-center gap-2 pt-2">
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">
                {card?.status === "paid" ? "Paga" : "Aberta"}
                Aberta (Fecha em {card?.dia_fechamento}/10)
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Compras nesta Fatura</CardTitle>
              <CardDescription>
                Detalhamento de todos os itens parcelados e compras únicas.
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={showMine} onCheckedChange={setShowMine} />
                Minhas compras
              </label>
              <AddBuy card={card} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor Mensal</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedPurchases.map((p) => (
                  <TableRow
                    key={p.id}
                    className="group hover:bg-secondary/20 transition-colors"
                  >
                    <TableCell>
                      <div className="font-medium">{p.descricao}</div>
                      {p.tipo === "installment" && (
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Layers className="h-3 w-3" />
                          Parcela {p.parcela_atual} de {p.parcelas_total}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-normal"
                      >
                        {p.tipo === "one-time" ? "Compra Única" : "Parcelado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(p.data).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(p.valor)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onSelect={() => {
                              setEditingTransaction(p as TransactionBD);
                              setIsEditOpen(true);
                            }}
                          >
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              if (
                                confirm("Confirma exclusão desta transação?")
                              ) {
                                deleteTxnMutation.mutate(p.id!);
                              }
                            }}
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {account?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground"
                    >
                      Nenhuma compra ativa para esta fatura.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <CardFooter className="flex justify-end">
            <div className="text-sm text-muted-foreground mr-4">
              Total (exibido):
            </div>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(displayedTotal)}
            </div>
          </CardFooter>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-amber-100 bg-amber-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Atenção com as Parcelas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-800 leading-relaxed">
              Itens marcados como **Parcelado** continuarão aparecendo nas
              próximas faturas até que a última parcela seja paga. Somente na
              última parcela o item será removido do controle.
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-100 bg-blue-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Resumo do Ciclo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-800">Dia do Fechamento</span>
              <span className="font-bold">Todo dia {card?.dia_fechamento}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-800">Dia do Vencimento</span>
              <span className="font-bold">Todo dia {card?.dia_vencimento}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      {/** Controlled Edit dialog rendered outside the dropdown to avoid unmounting issues */}
      <EditBuy
        transaction={editingTransaction}
        cardId={id}
        open={isEditOpen}
        onOpenChange={(v: boolean) => {
          setIsEditOpen(v);
          if (!v) setEditingTransaction(null);
        }}
      />
    </div>
  );
}
