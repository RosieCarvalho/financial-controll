import { useState } from "react";
import { 
  CreditCard, 
  Plus, 
  User, 
  ChevronRight, 
  AlertCircle, 
  Calendar,
  Info,
  Layers,
  MoreVertical
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MOCK_CARDS = [
  { id: '1', name: 'Nubank', limit: 15000, used: 2500.50, dueDay: 12, closingDay: 5, color: 'bg-purple-600' },
  { id: '2', name: 'Inter', limit: 5000, used: 1200.20, dueDay: 15, closingDay: 8, color: 'bg-orange-500' },
];

const MOCK_THIRD_PARTY = [
  { id: 't1', person: 'João Silva', desc: 'Monitor Gamer', amount: 1500, installments: 10, paid: 3, cardId: '1', date: '2023-08-10' },
  { id: 't2', person: 'Maria Oliveira', desc: 'Tênis Corrida', amount: 350, installments: 2, paid: 1, cardId: '2', date: '2023-09-05' },
];

export default function CardsPage() {
  const [activeTab, setActiveTab] = useState("my-cards");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cartões e Terceiros</h1>
          <p className="text-muted-foreground">Gerencie seus cartões e compras de outras pessoas no seu crédito.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="hidden md:flex items-center gap-2">
            <Info className="h-4 w-4" />
            Como funciona?
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Novo
          </Button>
        </div>
      </div>

      <Tabs defaultValue="my-cards" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="my-cards">Meus Cartões</TabsTrigger>
          <TabsTrigger value="third-party">Compras de Terceiros</TabsTrigger>
        </TabsList>

        <TabsContent value="my-cards" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {MOCK_CARDS.map((card) => (
              <Card key={card.id} className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden group">
                <div className={cn("h-2 w-full", card.color)} />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-4">
                    <div className={cn("p-3 rounded-xl text-white shadow-md", card.color)}>
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{card.name}</CardTitle>
                      <CardDescription>Vencimento dia {card.dueDay}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] h-5 bg-secondary/50">Fecha dia {card.closingDay}</Badge>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Fatura Atual</p>
                      <h3 className="text-3xl font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.used)}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Limite Disponível</p>
                      <p className="text-sm font-medium text-emerald-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.limit - card.used)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Uso do Limite</span>
                      <span>{Math.round((card.used / card.limit) * 100)}%</span>
                    </div>
                    <Progress value={(card.used / card.limit) * 100} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter className="bg-secondary/20 border-t flex justify-between px-6 py-4">
                  <Button variant="ghost" size="sm" className="gap-2">Ver Detalhes <ChevronRight className="h-4 w-4" /></Button>
                  <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200">Pagar Fatura</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="third-party" className="space-y-6">
          <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Compras de Terceiros</CardTitle>
              <CardDescription>Rastreie compras que amigos ou familiares fizeram no seu cartão.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="grid grid-cols-1 divide-y">
                  {MOCK_THIRD_PARTY.map((tp) => {
                    const card = MOCK_CARDS.find(c => c.id === tp.cardId);
                    return (
                      <div key={tp.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-secondary/30 transition-colors duration-200">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-secondary rounded-lg text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{tp.person}</span>
                              <Badge variant="secondary" className="text-[10px] py-0">{card?.name}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{tp.desc}</p>
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-1">
                          <p className="font-bold text-lg">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tp.amount)}
                          </p>
                          <div className="flex items-center gap-2">
                            <Layers className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Parcela {tp.paid} de {tp.installments}
                            </span>
                            <Progress value={(tp.paid / tp.installments) * 100} className="h-1.5 w-16" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end md:self-center">
                          <Button variant="outline" size="sm" className="h-8">Receber</Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-emerald-100 bg-emerald-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-emerald-600" />
                  Dica Financeira
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-emerald-800 leading-relaxed">
                  Ao emprestar seu cartão para terceiros, certifique-se de registrar cada parcela. Assim, você não esquece de cobrar e seu fluxo de caixa fica correto!
                </p>
              </CardContent>
            </Card>
            <Card className="border-blue-100 bg-blue-50/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Próximos Acertos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-800">João Silva</span>
                  <span className="font-bold">R$ 150,00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-800">Maria Oliveira</span>
                  <span className="font-bold">R$ 175,00</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
