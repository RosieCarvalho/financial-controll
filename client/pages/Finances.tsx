import { useState } from "react";
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
  Clock
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
  DialogTrigger 
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
];

export default function Finances() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredTransactions = MOCK_TRANSACTIONS.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || 
                      (activeTab === "income" && t.amount > 0) || 
                      (activeTab === "expense" && t.amount < 0);
    return matchesSearch && matchesTab;
  });

  const getCategory = (id: string) => MOCK_CATEGORIES.find(c => c.id === id);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">Gerencie suas receitas e despesas.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtrar
          </Button>
          <Dialog>
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
                  <Input id="desc" placeholder="Ex: Aluguel, Salário, etc." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="amount" className="text-sm font-medium">Valor</label>
                    <Input id="amount" type="number" placeholder="0.00" />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="date" className="text-sm font-medium">Data</label>
                    <Input id="date" type="date" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="cat" className="text-sm font-medium">Categoria</label>
                  <Select>
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
                  <label className="text-sm font-medium">Origem do Dinheiro (Opcional)</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Caixa padrão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Conta Principal</SelectItem>
                      <SelectItem value="fgts">Caixa FGTS</SelectItem>
                      <SelectItem value="reserva">Reserva de Emergência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancelar</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Salvar</Button>
              </div>
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
              <h3 className="text-2xl font-bold text-emerald-900">R$ 5.000,00</h3>
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
              <h3 className="text-2xl font-bold text-rose-900">R$ 2.306,15</h3>
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
              <h3 className="text-2xl font-bold text-blue-900">R$ 2.693,85</h3>
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
