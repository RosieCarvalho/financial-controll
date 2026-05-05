import { useState, useMemo, useEffect } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  PiggyBank,
  CheckCircle2,
  Clock,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";
import { Transaction, Category } from "@shared/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTransacoes,
  getCategorias,
  createTransaction,
  getTypesStatusTransaction,
  deleteTransaction as apiDeleteTransaction,
} from "@/src/lib/api";
import { toast } from "sonner";
import { NewTransactionDialog } from "./components/NewTransactionDialog";
import { DeleteTransactionModal } from "./components/DeleteTransactionModal";
import EditTransactionDialog from "./components/EditTransactionDialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/src/components/ui/dropdown-menu";
import { ta, tr } from "date-fns/locale";

const MONTHS = [
  { value: "0", label: "Janeiro" },
  { value: "1", label: "Fevereiro" },
  { value: "2", label: "Março" },
  { value: "3", label: "Abril" },
  { value: "4", label: "Maio" },
  { value: "5", label: "Junho" },
  { value: "6", label: "Julho" },
  { value: "7", label: "Agosto" },
  { value: "8", label: "Setembro" },
  { value: "9", label: "Outubro" },
  { value: "10", label: "Novembro" },
  { value: "11", label: "Dezembro" },
];

export default function Finances() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth().toString(),
  );

  const { data: transactionsData } = useQuery({
    queryKey: ["transacoes"],
    queryFn: getTransacoes,
  });
  const transactionsDataValue =
    transactionsData?.data ?? transactionsData ?? [];

  const { data: categoriesData } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
  });
  const categoriesDataValue = categoriesData?.data ?? categoriesData ?? [];
  const categoriesDataFinal = categoriesDataValue as Category[];

  const [transactions, setTransactions] = useState<Transaction[]>(
    transactionsDataValue,
  );

  const deleteTransaction = (id: string) => {
    setTransactions((current) => current.filter((t) => t.id !== id));
  };

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      return apiDeleteTransaction(id);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["transacoes"] }),
    onError: () => toast.error("Erro ao excluir transação"),
  });
  const addTransaction = useMutation({
    mutationFn: createTransaction,
    onMutate: async (newTx: any) => {
      await queryClient.cancelQueries({ queryKey: ["transacoes"] });
      const previous = queryClient.getQueryData(["transacoes"]);
      setTransactions((current) => [newTx, ...(current ?? [])]);
      return { previous };
    },
    onError: (_err, _newTx, context: any) => {
      setTransactions(context?.previous ?? []);
      toast.error("Erro ao salvar transação.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transacoes"] });
    },
  });

  const [editingTransaction, setEditingTransaction] = useState<any | null>(
    null,
  );
  const [deletingTransaction, setDeletingTransaction] = useState<any | null>(
    null,
  );

  useEffect(() => {
    if (transactionsData)
      setTransactions(
        (transactionsData as any)?.data ?? (transactionsData as any) ?? [],
      );
  }, [transactionsData]);

  const getCategory = (id: string) => {
    console.log(`Getting category for id ${id}`);
    const category = categoriesDataFinal.find((c: Category) => c.id === id);
    if (category) {
      console.log(`Found category for id ${id}: ${JSON.stringify(category)}`);
    } else {
      console.log(`Category not found for id ${id}`);
    }
    return category ?? null;
  };
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      const matchesMonth =
        transactionDate.getMonth().toString() === selectedMonth;
      const matchesSearch = (t.description ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "income" &&
          getCategory(t.categoryId)?.type === "income") ||
        (activeTab === "expense" &&
          getCategory(t.categoryId)?.type === "expense");
      return (
        (matchesMonth && matchesSearch && matchesTab) ||
        (t.type === "fixed" && matchesTab)
      );
    });
  }, [transactions, searchTerm, activeTab, selectedMonth]);
  console.log(transactions);
  const filteredTotal = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  }, [filteredTransactions]);
  const stats = useMemo(() => {
    const income = transactions
      .filter((t) => {
        const category = getCategory(t.categoryId);
        return category?.type === "income";
      })
      .reduce((acc, t) => acc + t.amount, 0);
    const expenses = Math.abs(
      transactions
        .filter((t) => {
          const category = getCategory(t.categoryId);
          return category?.type === "expense";
        })
        .reduce((acc, t) => acc + t.amount, 0),
    );
    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [transactions, categoriesDataValue]);

  const handleAddTransaction = (tx: {
    description: string;
    amount: number;
    date: string;
    categoryId: string;
    type: "fixed" | "one-time";
    status: "pending" | "paid" | "received";
  }) => {
    const newTransaction: any = {
      id: Math.random().toString(36).substr(2, 9),
      ...tx,
    };
    addTransaction.mutate(newTransaction);
    toast.success("Transação enviada para salvamento...");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">
            Gerencie suas receitas e despesas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[150px] bg-white shadow-sm border-emerald-100 focus:ring-emerald-500">
              <Calendar className="mr-2 h-4 w-4 text-emerald-600" />
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <NewTransactionDialog
            categories={categoriesData ?? []}
            onSubmit={handleAddTransaction}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800">
                Receitas do Mês
              </p>
              <h3 className="text-2xl font-bold text-emerald-900">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(stats.income)}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-rose-50 border-rose-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-rose-800">
                Despesas do Mês
              </p>
              <h3 className="text-2xl font-bold text-rose-900">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(stats.expenses)}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
              <PiggyBank className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">
                Saldo Disponível
              </p>
              <h3 className="text-2xl font-bold text-blue-900">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(stats.balance)}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>
                Acompanhe todos os seus movimentos financeiros.
              </CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all">Tudo</TabsTrigger>
              <TabsTrigger value="income">Receitas</TabsTrigger>
              <TabsTrigger value="expense">Despesas</TabsTrigger>
            </TabsList>
            <div className="rounded-xl border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30">
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((t) => {
                    const category = getCategory(t.categoryId);
                    return (
                      <TableRow
                        key={t.id}
                        className="group transition-colors duration-200"
                      >
                        <TableCell>
                          <div className="font-medium">{t.description}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {t.type === "fixed" ? "Fixo" : "Único"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: category?.color || "#cbd5e1",
                              }}
                            />
                            <span className="text-sm">{category?.name}</span>
                            {category?.rule && (
                              <Badge
                                variant="outline"
                                className="text-[10px] h-4 py-0 font-normal"
                              >
                                Rule {category.rule}%
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(t.date).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          {t.status === "paid" ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none flex w-fit items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Pago
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none flex w-fit items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-bold",
                            t.amount > 0
                              ? "text-emerald-600"
                              : "text-foreground",
                          )}
                        >
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(t.amount)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onSelect={() => setEditingTransaction(t)}
                              >
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onSelect={() => setDeletingTransaction(t)}
                              >
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filteredTransactions.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhuma transação encontrada.
                </div>
              )}
            </div>
            <div className="p-4 flex justify-end items-center">
              <div className="text-sm text-muted-foreground mr-4">
                Total (exibido):
              </div>
              <div className="text-lg font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(filteredTotal)}
              </div>
            </div>
            {editingTransaction && (
              <EditTransactionDialog
                transaction={editingTransaction}
                categories={categoriesDataFinal}
                open={Boolean(editingTransaction)}
                onOpenChange={(v) => !v && setEditingTransaction(null)}
              />
            )}
            {deletingTransaction && (
              <DeleteTransactionModal
                transactionId={deletingTransaction.id}
                onSuccess={() => {
                  deleteTransaction(deletingTransaction.id);
                  setDeletingTransaction(null);
                }}
                open={Boolean(deletingTransaction)}
                onOpenChange={(v) => !v && setDeletingTransaction(null)}
              />
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
