import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Pencil,
  Trash2,
  PiggyBank,
  CheckCircle2,
  Clock,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Category, Transaction } from "@shared/api";
import { toast } from "sonner";

const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Aluguel', rule: '50', type: 'expense', color: '#059669' },
  { id: '2', name: 'Supermercado', rule: '50', type: 'expense', color: '#059669' },
  { id: '3', name: 'Streaming', rule: '30', type: 'expense', color: '#10b981' },
  { id: '4', name: 'Investimentos', rule: '20', type: 'expense', color: '#34d399' },
  { id: '5', name: 'Salário', rule: '50', type: 'income' },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', description: 'Salário Mensal', amount: 5000, date: '2023-10-05', categoryId: '5', type: 'fixed', status: 'paid' },
  { id: '2', description: 'Aluguel Outubro', amount: -1800, date: '2023-10-05', categoryId: '1', type: 'fixed', status: 'paid' },
  { id: '3', description: 'Netflix', amount: -55.90, date: '2023-10-08', categoryId: '3', type: 'fixed', status: 'paid' },
  { id: '4', description: 'Supermercado BH', amount: -450.25, date: '2023-10-10', categoryId: '2', type: 'one-time', status: 'pending' },
  { id: '5', description: 'Combustível', amount: -200, date: '2023-09-15', categoryId: '2', type: 'one-time', status: 'paid' },
];

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
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<"fixed" | "one-time">("one-time");

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const matchesMonth = transactionDate.getMonth().toString() === selectedMonth;
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === "all" ||
                        (activeTab === "income" && t.amount > 0) ||
                        (activeTab === "expense" && t.amount < 0);
      return matchesMonth && matchesSearch && matchesTab;
    });
  }, [transactions, searchTerm, activeTab, selectedMonth]);

  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.amount > 0)
      .reduce((acc, t) => acc + t.amount, 0);
    const expenses = Math.abs(filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => acc + t.amount, 0));
    return {
      income,
      expenses,
      balance: income - expenses
    };
  }, [filteredTransactions]);

  const handleAddTransaction = () => {
    if (!desc || !amount || !date || !categoryId) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const cat = MOCK_CATEGORIES.find(c => c.id === categoryId);
    const numericAmount = parseFloat(amount);
    const finalAmount = cat?.type === 'expense' ? -Math.abs(numericAmount) : Math.abs(numericAmount);

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      description: desc,
      amount: finalAmount,
      date: date,
      categoryId: categoryId,
      type: type,
      status: 'paid'
    };

    setTransactions([newTransaction, ...transactions]);
    setIsDialogOpen(false);
    resetForm();
    toast.success("Transação adicionada com sucesso!");
  };

  const resetForm = () => {
    setDesc("");
    setAmount("");
    setDate(new Date().toISOString().split('T')[0]);
    setCategoryId("");
    setType("one-time");
  };

  const getCategory = (id: string) => MOCK_CATEGORIES.find(c => c.id === id);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">Gerencie suas receitas e despesas.</p>
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nova Transação</DialogTitle>
                <DialogDescription>
                  Adicione uma nova receita ou despesa ao seu controle.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="desc" className="text-sm font-medium">Descrição</label>
                  <Input
                    id="desc"
                    placeholder="Ex: Aluguel, Salário, etc."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="amount" className="text-sm font-medium">Valor</label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="date" className="text-sm font-medium">Data</label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="cat" className="text-sm font-medium">Categoria</label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_CATEGORIES.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name} ({c.rule}%)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">Único</SelectItem>
                      <SelectItem value="fixed">Fixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleAddTransaction}>Salvar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800">Receitas do Mês</p>
              <h3 className="text-2xl font-bold text-emerald-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.income)}
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
              <p className="text-sm font-medium text-rose-800">Despesas do Mês</p>
              <h3 className="text-2xl font-bold text-rose-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.expenses)}
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
              <p className="text-sm font-medium text-blue-800">Saldo Disponível</p>
              <h3 className="text-2xl font-bold text-blue-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.balance)}
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
              <CardDescription>Acompanhe todos os seus movimentos financeiros.</CardDescription>
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
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
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
                      <TableRow key={t.id} className="group transition-colors duration-200">
                        <TableCell>
                          <div className="font-medium">{t.description}</div>
                          <div className="text-xs text-muted-foreground capitalize">{t.type === 'fixed' ? 'Fixo' : 'Único'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category?.color || '#cbd5e1' }} />
                            <span className="text-sm">{category?.name}</span>
                            {category?.rule && (
                              <Badge variant="outline" className="text-[10px] h-4 py-0 font-normal">
                                Rule {category.rule}%
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(t.date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          {t.status === 'paid' ? (
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
                        <TableCell className={cn(
                          "text-right font-bold",
                          t.amount > 0 ? "text-emerald-600" : "text-foreground"
                        )}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
