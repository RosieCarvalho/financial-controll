import { Link } from "react-router-dom";
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
  MoreVertical,
  Palette,
  CheckCircle2
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MOCK_CARDS = [
  { id: '1', name: 'Nubank', limit: 15000, used: 2500.50, dueDay: 12, closingDay: 5, color: 'bg-purple-600' },
  { id: '2', name: 'Inter', limit: 5000, used: 1200.20, dueDay: 15, closingDay: 8, color: 'bg-orange-500' },
];

const MOCK_THIRD_PARTY = [
  { id: 't1', person: 'João Silva', desc: 'Monitor Gamer', amount: 1500, installments: 10, paid: 3, cardId: '1', date: '2023-08-10' },
  { id: 't2', person: 'Maria Oliveira', desc: 'Tênis Corrida', amount: 350, installments: 2, paid: 1, cardId: '2', date: '2023-09-05' },
];

const COLORS = [
  { name: 'Roxo', value: 'bg-purple-600' },
  { name: 'Laranja', value: 'bg-orange-500' },
  { name: 'Azul', value: 'bg-blue-600' },
  { name: 'Verde', value: 'bg-emerald-600' },
  { name: 'Preto', value: 'bg-zinc-900' },
  { name: 'Vermelho', value: 'bg-rose-600' },
];

export default function CardsPage() {
  const [activeTab, setActiveTab] = useState("my-cards");
  const [cards, setCards] = useState(MOCK_CARDS);
  const [thirdParty, setThirdParty] = useState(MOCK_THIRD_PARTY);
  
  // State for New Card
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
  const [newCard, setNewCard] = useState({ name: '', limit: '', dueDay: '', closingDay: '', color: 'bg-purple-600' });

  // State for New Third Party Purchase
  const [isTPDialogOpen, setIsTPDialogOpen] = useState(false);
  const [newTP, setNewTP] = useState({ person: '', desc: '', amount: '', installments: '', cardId: '', date: new Date().toISOString().split('T')[0] });

  const handleAddCard = () => {
    if (!newCard.name || !newCard.limit || !newCard.dueDay || !newCard.closingDay) {
      toast.error("Preencha todos os campos do cartão!");
      return;
    }
    const card = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCard.name,
      limit: parseFloat(newCard.limit),
      used: 0,
      dueDay: parseInt(newCard.dueDay),
      closingDay: parseInt(newCard.closingDay),
      color: newCard.color
    };
    setCards([...cards, card]);
    setIsCardDialogOpen(false);
    setNewCard({ name: '', limit: '', dueDay: '', closingDay: '', color: 'bg-purple-600' });
    toast.success("Cartão adicionado com sucesso!");
  };

  const handleAddTP = () => {
    if (!newTP.person || !newTP.desc || !newTP.amount || !newTP.installments || !newTP.cardId) {
      toast.error("Preencha todos os campos da compra!");
      return;
    }
    const purchase = {
      id: Math.random().toString(36).substr(2, 9),
      person: newTP.person,
      desc: newTP.desc,
      amount: parseFloat(newTP.amount),
      installments: parseInt(newTP.installments),
      paid: 0,
      cardId: newTP.cardId,
      date: newTP.date
    };
    setThirdParty([...thirdParty, purchase]);
    setIsTPDialogOpen(false);
    setNewTP({ person: '', desc: '', amount: '', installments: '', cardId: '', date: new Date().toISOString().split('T')[0] });
    toast.success("Compra de terceiro registrada!");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cartões e Terceiros</h1>
          <p className="text-muted-foreground">Gerencie seus cartões e compras de outras pessoas no seu crédito.</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Novo Cartão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cartão</DialogTitle>
                <DialogDescription>Cadastre um novo cartão de crédito para controle.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Nome do Banco/Cartão</label>
                  <Input 
                    placeholder="Ex: Nubank, Inter, XP" 
                    value={newCard.name}
                    onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Limite Total</label>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={newCard.limit}
                      onChange={(e) => setNewCard({...newCard, limit: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Cor</label>
                    <Select value={newCard.color} onValueChange={(v) => setNewCard({...newCard, color: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COLORS.map(c => (
                          <SelectItem key={c.value} value={c.value}>
                            <div className="flex items-center gap-2">
                              <div className={cn("w-3 h-3 rounded-full", c.value)} />
                              {c.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Dia Fechamento</label>
                    <Input 
                      type="number" 
                      placeholder="Ex: 5" 
                      value={newCard.closingDay}
                      onChange={(e) => setNewCard({...newCard, closingDay: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Dia Vencimento</label>
                    <Input 
                      type="number" 
                      placeholder="Ex: 12" 
                      value={newCard.dueDay}
                      onChange={(e) => setNewCard({...newCard, dueDay: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCardDialogOpen(false)}>Cancelar</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleAddCard}>Salvar Cartão</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isTPDialogOpen} onOpenChange={setIsTPDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Compra de Terceiro
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Registrar Compra de Terceiro</DialogTitle>
                <DialogDescription>Alguém usou seu cartão? Registre aqui para não esquecer de cobrar.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Nome da Pessoa</label>
                    <Input 
                      placeholder="Ex: João Silva" 
                      value={newTP.person}
                      onChange={(e) => setNewTP({...newTP, person: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Cartão Utilizado</label>
                    <Select value={newTP.cardId} onValueChange={(v) => setNewTP({...newTP, cardId: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {cards.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">O que foi comprado?</label>
                  <Input 
                    placeholder="Ex: Monitor Gamer, Tênis" 
                    value={newTP.desc}
                    onChange={(e) => setNewTP({...newTP, desc: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2 col-span-2">
                    <label className="text-sm font-medium">Valor Total</label>
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      value={newTP.amount}
                      onChange={(e) => setNewTP({...newTP, amount: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Parcelas</label>
                    <Input 
                      type="number" 
                      placeholder="Ex: 10" 
                      value={newTP.installments}
                      onChange={(e) => setNewTP({...newTP, installments: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTPDialogOpen(false)}>Cancelar</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleAddTP}>Salvar Compra</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="my-cards" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="my-cards">Meus Cartões</TabsTrigger>
          <TabsTrigger value="third-party">Compras de Terceiros</TabsTrigger>
        </TabsList>

        <TabsContent value="my-cards" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {cards.map((card) => (
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
                  <Link to={`/cards/${card.id}`}>
                    <Button variant="ghost" size="sm" className="gap-2">Ver Detalhes <ChevronRight className="h-4 w-4" /></Button>
                  </Link>
                  <Link to={`/cards/${card.id}`}>
                    <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200">Pagar Fatura</Button>
                  </Link>
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
                  {thirdParty.map((tp) => {
                    const card = cards.find(c => c.id === tp.cardId);
                    return (
                      <div key={tp.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-secondary/30 transition-colors duration-200">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-secondary rounded-lg text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{tp.person}</span>
                              <Badge variant="secondary" className="text-[10px] py-0">{card?.name || 'Cartão não encontrado'}</Badge>
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
                            <Progress value={tp.installments > 0 ? (tp.paid / tp.installments) * 100 : 0} className="h-1.5 w-16" />
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
                {thirdParty.slice(0, 3).map(tp => (
                  <div key={tp.id} className="flex justify-between text-sm">
                    <span className="text-blue-800">{tp.person}</span>
                    <span className="font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tp.amount / tp.installments)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
