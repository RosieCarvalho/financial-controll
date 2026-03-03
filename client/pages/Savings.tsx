import { useState } from "react";
import { 
  PiggyBank, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreVertical, 
  History, 
  Target,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CashBox } from "@shared/api";
import { cn } from "@/lib/utils";

const MOCK_SAVINGS: CashBox[] = [
  {
    id: '1',
    name: 'Reserva de Emergência',
    balance: 5000,
    description: 'Fundo para imprevistos (6 meses de despesas)',
    history: [
      { id: 'h1', amount: 500, date: '2023-10-01', type: 'deposit', description: 'Aporte mensal' },
      { id: 'h2', amount: -200, date: '2023-09-15', type: 'withdrawal', description: 'Conserto chuveiro' },
    ]
  },
  {
    id: '2',
    name: 'FGTS',
    balance: 12450.80,
    description: 'Fundo de Garantia do Tempo de Serviço',
    history: [
      { id: 'h3', amount: 450.80, date: '2023-10-05', type: 'deposit', description: 'Depósito empresa' },
    ]
  },
  {
    id: '3',
    name: 'Viagem Japão 2025',
    balance: 2300,
    description: 'Economia para viagem de férias',
    history: [
      { id: 'h4', amount: 300, date: '2023-10-02', type: 'deposit', description: 'Sobras do mês' },
    ]
  }
];

export default function Savings() {
  const [boxes, setBoxes] = useState(MOCK_SAVINGS);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Caixinhas</h1>
          <p className="text-muted-foreground">Gerencie seu dinheiro guardado e metas de economia.</p>
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
                <Input placeholder="Ex: Reforma da Casa, Troca de Carro" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Descrição</label>
                <Input placeholder="Para que serve esse dinheiro?" />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Saldo Inicial (Opcional)</label>
                <Input type="number" placeholder="0.00" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline">Cancelar</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Criar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {boxes.map((box) => (
          <Card key={box.id} className="border-none shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-md overflow-hidden group">
            <div className="h-2 w-full bg-emerald-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <PiggyBank className="h-5 w-5" />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-foreground">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="mt-4">{box.name}</CardTitle>
              <CardDescription className="line-clamp-1">{box.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Saldo Atual</p>
                <h2 className="text-3xl font-bold text-foreground">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(box.balance)}
                </h2>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <History className="h-3 w-3" /> Última movimentação
                  </span>
                  <span className="font-medium">{box.history[0]?.date}</span>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50 text-xs flex items-center justify-between">
                  <span className="truncate flex-1">{box.history[0]?.description}</span>
                  <span className={cn(
                    "font-bold ml-2",
                    box.history[0]?.type === 'deposit' ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {box.history[0]?.type === 'deposit' ? '+' : ''}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(box.history[0]?.amount)}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-secondary/20 border-t pt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="w-full gap-2">
                <ArrowDownRight className="h-4 w-4 text-rose-500" /> Resgatar
              </Button>
              <Button variant="outline" size="sm" className="w-full gap-2 border-emerald-200 hover:bg-emerald-50">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" /> Guardar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Por que usar Caixinhas?
          </CardTitle>
          <CardDescription>
            Separar seu dinheiro por objetivos ajuda a manter o foco e evita gastos impulsivos.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <div className="p-2 w-fit bg-blue-100 rounded-lg text-blue-600">
              <Target className="h-4 w-4" />
            </div>
            <h4 className="font-bold text-sm">Objetivos Claros</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dê um nome e um propósito para cada centavo guardado. Isso aumenta sua motivação.
            </p>
          </div>
          <div className="space-y-2">
            <div className="p-2 w-fit bg-emerald-100 rounded-lg text-emerald-600">
              <History className="h-4 w-4" />
            </div>
            <h4 className="font-bold text-sm">Rastreamento</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Veja exatamente como seu dinheiro está crescendo ao longo do tempo com o histórico detalhado.
            </p>
          </div>
          <div className="space-y-2">
            <div className="p-2 w-fit bg-amber-100 rounded-lg text-amber-600">
              <ArrowDownRight className="h-4 w-4" />
            </div>
            <h4 className="font-bold text-sm">Integração</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ao pagar uma despesa, você pode escolher de qual caixinha o dinheiro deve sair.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
