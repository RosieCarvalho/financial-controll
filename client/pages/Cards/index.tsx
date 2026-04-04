import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@/hooks/use-form";
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
  receiveCompraTerceiro,
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
import { ThirdPartyList } from "./ThirdPartyList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AccountThirdParty as thirdPartyType,
  Card as CardType,
} from "@shared/api";
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
  const { data: cardsData, isLoading: isLoadingCards } = useQuery<CardType[]>({
    queryKey: ["cartoes"],
    queryFn: getCartoes,
  });

  const { data: thirdPartyQueryData, isLoading: isLoadingThirdParty } =
    useQuery<thirdPartyType[]>({
      queryKey: ["compras_terceiros"],
      queryFn: getComprasTerceiros,
    });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [addType, setAddType] = useState<"card" | "third-party">("card");

  const {
    values: form,
    setFieldValue,
    reset: resetForms,
  } = useForm({
    card: {
      name: "",
      limit: "",
      dueDay: "",
      closingDay: "",
      color: "bg-purple-600",
    },
    thirdParty: {
      person: "",
      desc: "",
      amount: "",
      installments: "",
      cardId: "",
    },
  });

  const handleAddCard = () => {
    const { name, limit, dueDay, closingDay, color } = form.card;
    if (!name || !limit || !dueDay || !closingDay) {
      toast.error("Por favor, preencha todos os campos do cartão.");
      return;
    }

    const newCard = {
      nome: name,
      limite: parseFloat(limit),
      dia_vencimento: parseInt(dueDay),
      dia_fechamento: parseInt(closingDay),
      cor: color,
    };

    // optimistic create via mutation
    addCardMutation.mutate(newCard);
    setIsDialogOpen(false);
    toast.success("Novo cartão enviado para o servidor...");
    resetForms();
  };

  const handleAddThirdParty = () => {
    const { person, desc, amount, installments, cardId } = form.thirdParty;
    if (!person || !desc || !amount || !installments || !cardId) {
      toast.error("Por favor, preencha todos os campos da compra.");
      return;
    }

    const newItem = {
      nome_pessoa: person,
      descricao: desc,
      valor: parseFloat(amount),
      parcelas: parseInt(installments),
      parcelas_pagas: 0,
      cartao_id: cardId,
      data: new Date().toISOString().split("T")[0],
    };

    addThirdPartyMutation.mutate(newItem);
    setIsDialogOpen(false);
    toast.success("Compra de terceiro enviada para o servidor...");
    resetForms();
  };

  const handleReceivePayment = (id: string) => {
    receivePaymentMutation.mutate(id);
  };

  const queryClient = useQueryClient();

  const receivePaymentMutation = useMutation({
    mutationFn: receiveCompraTerceiro,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["transacoes"] });
      const previous = queryClient.getQueryData(["transacoes"]);
      return { previous };
    },

    onSuccess: () => {
      // Invalidamos os dados para refletir o novo status e progresso na UI
      queryClient.invalidateQueries({ queryKey: ["compras_terceiros"] });
      queryClient.invalidateQueries({ queryKey: ["transacoes"] });
      queryClient.invalidateQueries({ queryKey: ["cartoes"] });
      toast.success("Pagamento recebido!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const addCardMutation = useMutation({
    mutationFn: createCartao,
    onMutate: async (newCard: any) => {
      await queryClient.cancelQueries({ queryKey: ["cartoes"] });
      const previous = queryClient.getQueryData(["cartoes"]);

      return { previous };
    },
    onError: (err, newCard, context: any) => {
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

      return { previous };
    },
    onError: (err, newItem, context: any) => {
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
            form={form}
            setFieldValue={setFieldValue}
            handleAddCard={handleAddCard}
            handleAddThirdParty={handleAddThirdParty}
            resetForms={resetForms}
            cards={cardsData ?? []}
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
            {isLoadingCards
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[220px] rounded-xl border border-none bg-card/50 backdrop-blur-md animate-pulse overflow-hidden"
                  >
                    <div className="h-2 w-full bg-secondary" />
                    <div className="p-6 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-secondary" />
                        <div className="space-y-2">
                          <div className="h-5 w-32 bg-secondary rounded" />
                          <div className="h-4 w-24 bg-secondary rounded" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <div className="space-y-2">
                            <div className="h-3 w-16 bg-secondary rounded" />
                            <div className="h-8 w-32 bg-secondary rounded" />
                          </div>
                          <div className="h-8 w-24 bg-secondary rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              : cardsData?.map((card) => (
                  <Card
                    key={card.id}
                    className="border-none shadow-sm bg-card/50 backdrop-blur-md overflow-hidden group"
                  >
                    <div className={cn("h-2 w-full", card.cor)} />
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
                          <CardTitle className="text-xl">{card.nome}</CardTitle>
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
                            {card.limite > 0
                              ? Math.round(
                                  (card.total_transacoes / card.limite) * 100,
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            card.limite > 0
                              ? (card.total_transacoes / card.limite) * 100
                              : 0
                          }
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
                    </CardFooter>
                  </Card>
                ))}
          </div>
        </TabsContent>

        <TabsContent value="third-party" className="space-y-6">
          {isLoadingThirdParty ? (
            <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
              <CardHeader className="space-y-2">
                <div className="h-6 w-48 bg-secondary rounded animate-pulse" />
                <div className="h-4 w-72 bg-secondary rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border bg-card overflow-hidden divide-y divide-secondary/20">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-secondary" />
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-secondary rounded" />
                          <div className="h-3 w-32 bg-secondary rounded" />
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2">
                        <div className="h-6 w-20 bg-secondary rounded" />
                        <div className="h-3 w-16 bg-secondary rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <ThirdPartyList
              thirdParty={thirdPartyQueryData ?? []}
              cards={cardsData ?? []}
              handleReceivePayment={handleReceivePayment}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
