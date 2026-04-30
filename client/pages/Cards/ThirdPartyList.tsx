import {
  User,
  Layers,
  MoreVertical,
  AlertCircle,
  Calendar,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import EditThirdPartyDialog from "./components/EditThirdPartyDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCompraTerceiro } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AccountThirdParty, Card as CardType } from "@shared/api";

interface ThirdPartyListProps {
  thirdParty: AccountThirdParty[];
  cards: CardType[];
  handleReceivePayment: (id: string) => void;
}

export function ThirdPartyList({
  thirdParty,
  cards,
  handleReceivePayment,
}: ThirdPartyListProps) {
  const [query, setQuery] = useState("");
  const queryClient = useQueryClient();

  const filteredThirdParty = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return thirdParty ?? [];
    return (thirdParty ?? []).filter((tp) => {
      const nome = (tp.nome_pessoa || "").toLowerCase();
      const desc = (tp.descricao || "").toLowerCase();
      return (
        nome.includes(q) || desc.includes(q) || `${nome} ${desc}`.includes(q)
      );
    });
  }, [thirdParty, query]);

  const totalThirdParty = useMemo(() => {
    return (filteredThirdParty ?? []).reduce(
      (acc, tp) => acc + (tp.valor || 0),
      0,
    );
  }, [filteredThirdParty]);

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Compras de Terceiros</CardTitle>
          <CardDescription>
            Rastreie compras que amigos ou familiares fizeram no seu cartão.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome ou descrição"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="grid grid-cols-1 divide-y">
              {filteredThirdParty?.map((tp) => {
                const card = cards?.find((c) => c.id === tp.cartao_id);
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
                          <span className="font-bold">{tp.nome_pessoa}</span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] py-0"
                          >
                            {card?.nome || "Cartão não encontrado"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {tp.descricao}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-1">
                      <p className="font-bold text-lg">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(tp.valor)}
                      </p>
                      <div className="flex items-center gap-2">
                        <Layers className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Parcela {tp.parcelas_pagas ?? 0} de {tp.parcelas}
                        </span>
                        <Progress
                          value={
                            tp.parcelas > 0
                              ? ((tp.parcelas_pagas || 0) / tp.parcelas) * 100
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
                        disabled={tp.parcelas_pagas >= tp.parcelas}
                      >
                        {tp.parcelas_pagas >= tp.parcelas ? "Pago" : "Receber"}
                      </Button>
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
                          <DropdownMenuItem>
                            <EditThirdPartyDialog
                              item={tp}
                              trigger={<span>Editar</span>}
                            />
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              if (
                                confirm(
                                  "Confirma exclusão desta compra de terceiro?",
                                )
                              ) {
                                deleteCompraTerceiro(tp.id)
                                  .then(() => {
                                    queryClient.invalidateQueries({
                                      queryKey: ["compras_terceiros"],
                                    });
                                    alert("Excluído");
                                  })
                                  .catch(() => {
                                    alert("Erro ao excluir");
                                  });
                              }
                            }}
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-4 flex justify-end items-center">
            <div className="text-sm text-muted-foreground mr-4">
              Total (exibido):
            </div>
            <div className="text-lg font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalThirdParty)}
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
              Ao emprestar seu cartão para terceiros, certifique-se de registrar
              cada parcela. Assim, você não esquece de cobrar e seu fluxo de
              caixa fica correto!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
