import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCartoes, getTransacoes, createTransaction } from "@/lib/api";
import {
  CreditCard,
  ArrowLeft,
  ChevronRight,
  Layers,
  Calendar,
  Plus,
  MoreVertical,
  AlertCircle,
  Clock,
  CheckCircle2,
  Trash2,
  Tag,
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Transaction, CreditCard as CreditCardType } from "@shared/api";
import { toast } from "sonner";

// data loaded from API via react-query

export default function CardDetails() {
  const { id } = useParams();
  const { data: cartoes } = useQuery({
    queryKey: ["cartoes"],
    queryFn: getCartoes,
  });
  const { data: transacoes } = useQuery({
    queryKey: ["transacoes"],
    queryFn: getTransacoes,
  });

  const card = (cartoes ?? []).find((c: any) => String(c.id) === String(id));
  const [purchases, setPurchases] = useState<Transaction[]>([]);

  // Normalize transacoes -> purchases when data loads
  useEffect(() => {
    if (!transacoes) return;
    const filtered = (transacoes ?? []).filter(
      (t: any) => String(t.cartao_id) === String(id),
    );
    const normalized = filtered.map((t: any) => ({
      id: t.id,
      description: t.description ?? t.descricao ?? "",
      amount: t.valor ?? t.amount ?? 0,
      date: t.data ?? t.date ?? new Date().toISOString(),
      categoryId: t.category_id ?? t.categoria_id ?? t.categoryId,
      type: t.tipo ?? t.type ?? "one-time",
      status: t.status ?? "pending",
      cardId: t.cartao_id ?? t.cardId ?? t.cardId,
      currentInstallment: t.parcela_atual ?? t.currentInstallment,
      installmentsTotal: t.parcelas_total ?? t.installmentsTotal,
    }));
    setPurchases(normalized as any);
  }, [transacoes, id]);

  // New Purchase State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPurchase, setNewPurchase] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    type: "one-time" as "one-time" | "installment",
    installments: "1",
  });

  if (!card)
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Cartão não encontrado.</h2>
      </div>
    );

  const totalInvoice = purchases.reduce((acc, p) => acc + p.amount, 0);

  const handlePayInvoice = () => {
    const newPurchases = purchases.filter((p) => {
      const isOneTime = p.type === "one-time";
      const isLastInstallment =
        p.type === "installment" &&
        p.currentInstallment === p.installmentsTotal;
      return !isOneTime && !isLastInstallment;
    });
    setPurchases(newPurchases);
    toast.success("Fatura paga! Itens liquidados removidos.");
  };

  const handleAddPurchase = () => {
    if (!newPurchase.description || !newPurchase.amount) {
      toast.error("Preencha a descrição e o valor!");
      return;
    }

    const item = {
      description: newPurchase.description,
      valor: parseFloat(newPurchase.amount),
      data: newPurchase.date,
      category_id: "3",
      tipo: newPurchase.type,
      status: "pending",
      cartao_id: id,
      parcela_atual: newPurchase.type === "installment" ? 1 : undefined,
      parcelas_total:
        newPurchase.type === "installment"
          ? parseInt(newPurchase.installments)
          : undefined,
    };

    // optimistic update locally
    const localItem: any = {
      id: Math.random().toString(36).substr(2, 9),
      description: newPurchase.description,
      amount: parseFloat(newPurchase.amount),
      date: newPurchase.date,
      categoryId: "3",
      type: newPurchase.type,
      status: "pending",
      cardId: id,
      currentInstallment: newPurchase.type === "installment" ? 1 : undefined,
      installmentsTotal:
        newPurchase.type === "installment"
          ? parseInt(newPurchase.installments)
          : undefined,
    };

    setPurchases([...purchases, localItem]);
    createTransaction(item).catch(() => {
      /* ignore for now */
    });
    setIsDialogOpen(false);
    setNewPurchase({
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      type: "one-time",
      installments: "1",
    });
    toast.success("Compra adicionada com sucesso!");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/cards">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg text-white shadow-md",
                  card.color,
                )}
              >
                <CreditCard className="h-6 w-6" />
              </div>
              {card.name}
            </h1>
            <p className="text-muted-foreground">
              Fatura atual com vencimento dia {card.dueDay}.
            </p>
          </div>
        </div>
        <Button
          onClick={handlePayInvoice}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
        >
          Pagar Fatura Total
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Total da Fatura
            </CardDescription>
            <CardTitle className="text-3xl font-bold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totalInvoice)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Limite Disponível
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-600">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(card.limit - totalInvoice)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">
              Status
            </CardDescription>
            <CardTitle className="text-xl flex items-center gap-2 pt-2">
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">
                Aberta (Fecha em {card.closingDay}/10)
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Compras nesta Fatura</CardTitle>
              <CardDescription>
                Detalhamento de todos os itens parcelados e compras únicas.
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" /> Adicionar Compra
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Compra</DialogTitle>
                  <DialogDescription>
                    Registre uma nova compra no cartão {card.name}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Descrição</label>
                    <Input
                      placeholder="Ex: Supermercado, Amazon, etc."
                      value={newPurchase.description}
                      onChange={(e) =>
                        setNewPurchase({
                          ...newPurchase,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">
                        Valor da Parcela/Total
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={newPurchase.amount}
                        onChange={(e) =>
                          setNewPurchase({
                            ...newPurchase,
                            amount: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Data</label>
                      <Input
                        type="date"
                        value={newPurchase.date}
                        onChange={(e) =>
                          setNewPurchase({
                            ...newPurchase,
                            date: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Tipo</label>
                      <Select
                        value={newPurchase.type}
                        onValueChange={(v: "one-time" | "installment") =>
                          setNewPurchase({ ...newPurchase, type: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one-time">Compra Única</SelectItem>
                          <SelectItem value="installment">Parcelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newPurchase.type === "installment" && (
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">
                          Total Parcelas
                        </label>
                        <Input
                          type="number"
                          placeholder="Ex: 12"
                          value={newPurchase.installments}
                          onChange={(e) =>
                            setNewPurchase({
                              ...newPurchase,
                              installments: e.target.value,
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleAddPurchase}
                  >
                    Salvar Compra
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor Mensal</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(purchases ?? []).map((p) => (
                  <TableRow
                    key={p.id}
                    className="group hover:bg-secondary/20 transition-colors"
                  >
                    <TableCell>
                      <div className="font-medium">{p.description}</div>
                      {p.type === "installment" && (
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Layers className="h-3 w-3" />
                          Parcela {p.currentInstallment} de{" "}
                          {p.installmentsTotal}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-normal"
                      >
                        {p.type === "one-time" ? "Compra Única" : "Parcelado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(p.date).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(p.amount)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {purchases.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground"
                    >
                      Nenhuma compra ativa para esta fatura.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-amber-100 bg-amber-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Atenção com as Parcelas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-800 leading-relaxed">
              Itens marcados como **Parcelado** continuarão aparecendo nas
              próximas faturas até que a última parcela seja paga. Somente na
              última parcela o item será removido do controle.
            </p>
          </CardContent>
        </Card>
        <Card className="border-blue-100 bg-blue-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Resumo do Ciclo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-800">Dia do Fechamento</span>
              <span className="font-bold">Todo dia {card.closingDay}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-800">Dia do Vencimento</span>
              <span className="font-bold">Todo dia {card.dueDay}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
