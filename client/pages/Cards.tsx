import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCartoes,
  getPlanosFuturos,
  getTransacoes,
  getCaixas,
  getCategorias,
  getPlanosFuturos as _getPlanos,
  createCartao,
  createCompraTerceiro,
} from "@/lib/api";
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
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MOCK_CARDS = [
  {
    id: "1",
    name: "Nubank",
    limit: 15000,
    used: 2500.5,
    dueDay: 12,
    closingDay: 5,
    color: "bg-purple-600",
  },
  {
    id: "2",
    name: "Inter",
    limit: 5000,
    used: 1200.2,
    dueDay: 15,
    closingDay: 8,
    color: "bg-orange-500",
  },
];

const MOCK_THIRD_PARTY = [
  {
    id: "t1",
    person: "João Silva",
    desc: "Monitor Gamer",
    amount: 1500,
    installments: 10,
    paid: 3,
    cardId: "1",
    date: "2023-08-10",
  },
  {
    id: "t2",
    person: "Maria Oliveira",
    desc: "Tênis Corrida",
    amount: 350,
    installments: 2,
    paid: 1,
    cardId: "2",
    date: "2023-09-05",
  },
];

const COLORS = [
  { name: "Roxo", value: "bg-purple-600" },
  { name: "Laranja", value: "bg-orange-500" },
  { name: "Azul", value: "bg-blue-600" },
  { name: "Verde", value: "bg-emerald-600" },
  { name: "Preto", value: "bg-zinc-900" },
  { name: "Vermelho", value: "bg-rose-600" },
];

export default function CardsPage() {
  const [activeTab, setActiveTab] = useState("my-cards");
  const { data: cardsData } = useQuery({
    queryKey: ["cartoes"],
    queryFn: getCartoes,
  });
  const { data: thirdPartyData } = useQuery({
    queryKey: ["compras_terceiros"],
    queryFn: () => fetch("/api/compras_terceiros").then((r) => r.json()),
  });
  const [cards, setCards] = useState(cardsData ?? []);
  const [thirdParty, setThirdParty] = useState(thirdPartyData ?? []);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addType, setAddType] = useState<"card" | "third-party">("card");

  // Form states for New Card
  const [cardName, setCardName] = useState("");
  const [cardLimit, setCardLimit] = useState("");
  const [cardDueDay, setCardDueDay] = useState("");
  const [cardClosingDay, setCardClosingDay] = useState("");
  const [cardColor, setCardColor] = useState("bg-purple-600");

  // Form states for Third Party
  const [tpPerson, setTpPerson] = useState("");
  const [tpDesc, setTpDesc] = useState("");
  const [tpAmount, setTpAmount] = useState("");
  const [tpInstallments, setTpInstallments] = useState("");
  const [tpCardId, setTpCardId] = useState("");

  const resetForms = () => {
    setCardName("");
    setCardLimit("");
    setCardDueDay("");
    setCardClosingDay("");
    setCardColor("bg-purple-600");
    setTpPerson("");
    setTpDesc("");
    setTpAmount("");
    setTpInstallments("");
    setTpCardId("");
  };

  const handleAddCard = () => {
    if (!cardName || !cardLimit || !cardDueDay || !cardClosingDay) {
      toast.error("Por favor, preencha todos os campos do cartão.");
      return;
    }

    const newCard = {
      id: Math.random().toString(36).substr(2, 9),
      name: cardName,
      limit: parseFloat(cardLimit),
      used: 0,
      dueDay: parseInt(cardDueDay),
      closingDay: parseInt(cardClosingDay),
      color: cardColor,
    };

    // optimistic create via mutation
    addCardMutation.mutate(newCard);
    setIsDialogOpen(false);
    toast.success("Novo cartão enviado para o servidor...");
    resetForms();
  };

  const handleAddThirdParty = () => {
    if (!tpPerson || !tpDesc || !tpAmount || !tpInstallments || !tpCardId) {
      toast.error("Por favor, preencha todos os campos da compra.");
      return;
    }

    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      person: tpPerson,
      desc: tpDesc,
      amount: parseFloat(tpAmount),
      installments: parseInt(tpInstallments),
      paid: 0,
      cardId: tpCardId,
      date: new Date().toISOString().split("T")[0],
    };

    addThirdPartyMutation.mutate(newItem);
    setIsDialogOpen(false);
    toast.success("Compra de terceiro enviada para o servidor...");
    resetForms();
  };

  const handlePayInvoice = (id: string) => {
    setCards((currentCards) =>
      currentCards.map((card) => {
        if (card.id === id) {
          if (card.used > 0) {
            toast.success(`Fatura do ${card.name} paga com sucesso!`);
            return { ...card, used: 0 };
          } else {
            toast.info("Não há fatura pendente para este cartão.");
          }
        }
        return card;
      }),
    );
  };

  const handleReceivePayment = (id: string) => {
    setThirdParty((items) =>
      items.map((item) => {
        if (item.id === id) {
          if (item.paid < item.installments) {
            toast.success(`Pagamento recebido de ${item.person}!`);
            return { ...item, paid: item.paid + 1 };
          } else {
            toast.info("Todas as parcelas já foram pagas.");
          }
        }
        return item;
      }),
    );
  };

  // sync state when queries load
  useEffect(() => {
    if (cardsData) setCards(cardsData as any);
  }, [cardsData]);

  useEffect(() => {
    if (thirdPartyData) setThirdParty(thirdPartyData as any);
  }, [thirdPartyData]);

  const queryClient = useQueryClient();

  const addCardMutation = useMutation({
    mutationFn: createCartao,
    onMutate: async (newCard: any) => {
      await queryClient.cancelQueries({ queryKey: ["cartoes"] });
      const previous = queryClient.getQueryData(["cartoes"]);
      setCards((c) => [...(c ?? []), newCard]);
      return { previous };
    },
    onError: (err, newCard, context: any) => {
      setCards(context?.previous ?? MOCK_CARDS);
      toast.error("Erro ao criar cartão.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cartoes"] });
    },
  });

  const addThirdPartyMutation = useMutation({
    mutationFn: createCompraTerceiro,
    onMutate: async (newItem: any) => {
      await queryClient.cancelQueries({ queryKey: ["compras_terceiros"] });
      const previous = queryClient.getQueryData(["compras_terceiros"]);
      setThirdParty((c) => [newItem, ...(c ?? [])]);
      return { previous };
    },
    onError: (err, newItem, context: any) => {
      setThirdParty(context?.previous ?? MOCK_THIRD_PARTY);
      toast.error("Erro ao registrar compra de terceiro.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["compras_terceiros"] });
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Cartões e Terceiros
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus cartões e compras de outras pessoas no seu crédito.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden md:flex items-center gap-2"
          >
            <Info className="h-4 w-4" />
            Como funciona?
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center gap-2"
                onClick={() =>
                  setAddType(activeTab === "my-cards" ? "card" : "third-party")
                }
              >
                <Plus className="h-4 w-4" />
                Adicionar Novo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {addType === "card"
                    ? "Novo Cartão"
                    : "Nova Compra de Terceiro"}
                </DialogTitle>
                <DialogDescription>
                  {addType === "card"
                    ? "Adicione um novo cartão de crédito para gerenciar."
                    : "Registre uma compra feita por outra pessoa no seu cartão."}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <Tabs
                  value={addType}
                  onValueChange={(v) => setAddType(v as any)}
                >
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="card">Cartão</TabsTrigger>
                    <TabsTrigger value="third-party">Terceiro</TabsTrigger>
                  </TabsList>

                  <TabsContent value="card" className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="card-name">Nome do Cartão</Label>
                      <Input
                        id="card-name"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Ex: Nubank, Inter, Visa..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="card-limit">Limite Total</Label>
                        <Input
                          id="card-limit"
                          type="number"
                          value={cardLimit}
                          onChange={(e) => setCardLimit(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Cor</Label>
                        <Select value={cardColor} onValueChange={setCardColor}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {COLORS.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={cn(
                                      "w-3 h-3 rounded-full",
                                      c.value,
                                    )}
                                  />
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
                        <Label htmlFor="due-day">Dia do Vencimento</Label>
                        <Input
                          id="due-day"
                          type="number"
                          min="1"
                          max="31"
                          value={cardDueDay}
                          onChange={(e) => setCardDueDay(e.target.value)}
                          placeholder="Ex: 10"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="closing-day">Dia do Fechamento</Label>
                        <Input
                          id="closing-day"
                          type="number"
                          min="1"
                          max="31"
                          value={cardClosingDay}
                          onChange={(e) => setCardClosingDay(e.target.value)}
                          placeholder="Ex: 03"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="third-party" className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="tp-person">Nome da Pessoa</Label>
                      <Input
                        id="tp-person"
                        value={tpPerson}
                        onChange={(e) => setTpPerson(e.target.value)}
                        placeholder="Quem comprou?"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tp-desc">Descrição do Item</Label>
                      <Input
                        id="tp-desc"
                        value={tpDesc}
                        onChange={(e) => setTpDesc(e.target.value)}
                        placeholder="O que foi comprado?"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="tp-amount">Valor Total</Label>
                        <Input
                          id="tp-amount"
                          type="number"
                          value={tpAmount}
                          onChange={(e) => setTpAmount(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="tp-installments">Parcelas</Label>
                        <Input
                          id="tp-installments"
                          type="number"
                          value={tpInstallments}
                          onChange={(e) => setTpInstallments(e.target.value)}
                          placeholder="Ex: 10"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Cartão Utilizado</Label>
                      <Select value={tpCardId} onValueChange={setTpCardId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cartão" />
                        </SelectTrigger>
                        <SelectContent>
                          {cards.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForms();
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={
                    addType === "card" ? handleAddCard : handleAddThirdParty
                  }
                >
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs
        defaultValue="my-cards"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="my-cards">Meus Cartões</TabsTrigger>
          <TabsTrigger value="third-party">Compras de Terceiros</TabsTrigger>
        </TabsList>

        <TabsContent value="my-cards" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {cards.map((card) => (
              <Card
                key={card.id}
                className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden group"
              >
                <div className={cn("h-2 w-full", card.color)} />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "p-3 rounded-xl text-white shadow-md",
                        card.color,
                      )}
                    >
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{card.name}</CardTitle>
                      <CardDescription>
                        Vencimento dia {card.dueDay}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 bg-secondary/50"
                  >
                    Fecha dia {card.closingDay}
                  </Badge>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">
                        Fatura Atual
                      </p>
                      <h3 className="text-3xl font-bold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(card.used)}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">
                        Limite Disponível
                      </p>
                      <p className="text-sm font-medium text-emerald-600">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(card.limit - card.used)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Uso do Limite</span>
                      <span>{Math.round((card.used / card.limit) * 100)}%</span>
                    </div>
                    <Progress
                      value={(card.used / card.limit) * 100}
                      className="h-2"
                    />
                  </div>
                </CardContent>
                <CardFooter className="bg-secondary/20 border-t flex justify-between px-6 py-4">
                  <Link to={`/cards/${card.id}`}>
                    <Button variant="ghost" size="sm" className="gap-2">
                      Ver Detalhes <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-emerald-600 border-emerald-200"
                    onClick={() => handlePayInvoice(card.id)}
                    disabled={card.used === 0}
                  >
                    Pagar Fatura
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="third-party" className="space-y-6">
          <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Compras de Terceiros</CardTitle>
              <CardDescription>
                Rastreie compras que amigos ou familiares fizeram no seu cartão.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border bg-card overflow-hidden">
                <div className="grid grid-cols-1 divide-y">
                  {thirdParty.map((tp) => {
                    const card = cards.find((c) => c.id === tp.cardId);
                    return (
                      <div
                        key={tp.id}
                        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-secondary/30 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-secondary rounded-lg text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{tp.person}</span>
                              <Badge
                                variant="secondary"
                                className="text-[10px] py-0"
                              >
                                {card?.name || "Cartão não encontrado"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {tp.desc}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-1">
                          <p className="font-bold text-lg">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(tp.amount)}
                          </p>
                          <div className="flex items-center gap-2">
                            <Layers className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              Parcela {tp.paid} de {tp.installments}
                            </span>
                            <Progress
                              value={
                                tp.installments > 0
                                  ? (tp.paid / tp.installments) * 100
                                  : 0
                              }
                              className="h-1.5 w-16"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end md:self-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => handleReceivePayment(tp.id)}
                            disabled={tp.paid >= tp.installments}
                          >
                            {tp.paid >= tp.installments ? "Pago" : "Receber"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
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
                  Ao emprestar seu cartão para terceiros, certifique-se de
                  registrar cada parcela. Assim, você não esquece de cobrar e
                  seu fluxo de caixa fica correto!
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
                {thirdParty.slice(0, 3).map((tp) => (
                  <div key={tp.id} className="flex justify-between text-sm">
                    <span className="text-blue-800">{tp.person}</span>
                    <span className="font-bold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(tp.amount / tp.installments)}
                    </span>
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
