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
  getComprasTerceiros,
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
import { AddCardOrThirdPartyDialog } from "./components/AddCardOrThirdPartyDialog";
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

// Use API-provided cards and third-party purchases; no local mocks.

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
    queryFn: getComprasTerceiros,
  });
  const [cards, setCards] = useState(cardsData?.data ?? []);
  const [thirdParty, setThirdParty] = useState(thirdPartyData?.data ?? []);
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
    if (cardsData?.data) setCards(cardsData.data);
  }, [cardsData]);

  useEffect(() => {
    if (thirdPartyData?.data) setThirdParty(thirdPartyData.data);
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
      setCards(context?.previous ?? []);
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
      setThirdParty(context?.previous ?? []);
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
          <AddCardOrThirdPartyDialog
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            addType={addType}
            setAddType={setAddType}
            cardName={cardName}
            setCardName={setCardName}
            cardLimit={cardLimit}
            setCardLimit={setCardLimit}
            cardDueDay={cardDueDay}
            setCardDueDay={setCardDueDay}
            cardClosingDay={cardClosingDay}
            setCardClosingDay={setCardClosingDay}
            cardColor={cardColor}
            setCardColor={setCardColor}
            tpPerson={tpPerson}
            setTpPerson={setTpPerson}
            tpDesc={tpDesc}
            setTpDesc={setTpDesc}
            tpAmount={tpAmount}
            setTpAmount={setTpAmount}
            tpInstallments={tpInstallments}
            setTpInstallments={setTpInstallments}
            tpCardId={tpCardId}
            setTpCardId={setTpCardId}
            handleAddCard={handleAddCard}
            handleAddThirdParty={handleAddThirdParty}
            resetForms={resetForms}
            cards={cards}
          />
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
            {cardsData?.map((card) => (
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
                        card.cor,
                      )}
                    >
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{card.name}</CardTitle>
                      <CardDescription>
                        Vencimento dia {card.dia_vencimento}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 bg-secondary/50"
                  >
                    Fecha dia {card.dia_fechamento}
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
                        }).format(card.total_transacoes)}
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
                        }).format(card.limite - card.total_transacoes)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Uso do Limite</span>
                      <span>
                        {Math.round(
                          (card.total_transacoes / card.limite) * 100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={(card.total_transacoes / card.limite) * 100}
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
