import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPlanosFuturos } from "@/lib/api";
import {
  Plus,
  Sparkles,
  Search,
  MoreVertical,
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  CheckCircle2,
  Clock,
  ArrowRight,
  Lightbulb,
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FuturePlan } from "@shared/api";

const MOCK_MONTHLY_STATS = {
  avgIncome: 8500,
  avgExpenses: 4200,
  avgSurplus: 4300,
  currentBalance: 3440, // Based on previous session dashboard
};

const MOCK_PLANS: FuturePlan[] = [
  {
    id: "1",
    itemName: "MacBook Pro M3",
    totalValue: 12000,
    installments: 12,
    plannedMonth: 10, // November
    plannedYear: 2023,
    status: "pending",
  },
  {
    id: "2",
    itemName: "Viagem para Argentina",
    totalValue: 5000,
    installments: 5,
    plannedMonth: 0, // Janeiro
    plannedYear: 2024,
    status: "pending",
  },
];

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function FuturePlans() {
  const { data: plansData } = useQuery({
    queryKey: ["planos_futuros"],
    queryFn: getPlanosFuturos,
  });
  const [plans, setPlans] = useState<FuturePlan[]>(plansData ?? MOCK_PLANS);
  useEffect(() => {
    if (plansData) setPlans(plansData as any);
  }, [plansData]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [itemName, setItemName] = useState("");
  const [totalValue, setTotalValue] = useState("");
  const [installments, setInstallments] = useState("1");
  const [plannedMonth, setPlannedMonth] = useState(
    new Date().getMonth().toString(),
  );
  const [plannedYear, setPlannedYear] = useState(
    new Date().getFullYear().toString(),
  );

  const filteredPlans = plans.filter((p) =>
    p.itemName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const calculateComfort = (
    totalVal: number,
    inst: number,
    startMonth: number,
    startYear: number,
  ) => {
    const installmentVal = totalVal / inst;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Difference in months from now to planned month
    const monthsWait =
      (startYear - currentYear) * 12 + (startMonth - currentMonth);

    // Estimated balance by the planned month
    const estimatedBalanceAtStart =
      MOCK_MONTHLY_STATS.currentBalance +
      MOCK_MONTHLY_STATS.avgSurplus * Math.max(0, monthsWait);
    const balanceAfterPurchase =
      estimatedBalanceAtStart - (inst === 1 ? totalVal : installmentVal);

    // Comfort logic:
    // Is comfortable if installment is less than 25% of surplus
    // Or if one-time purchase leaves more than 1 month of expenses in balance
    const isComfortable =
      inst > 1
        ? installmentVal < MOCK_MONTHLY_STATS.avgSurplus * 0.4
        : totalVal < estimatedBalanceAtStart - MOCK_MONTHLY_STATS.avgExpenses;

    // Suggest a month: if not comfortable, suggest when it will be
    let suggestedMonth = startMonth;
    let suggestedYear = startYear;

    if (!isComfortable) {
      if (inst > 1) {
        // Find when surplus * 0.4 > installmentVal
        // In this simple mock, if it's not comfortable now, it won't be later unless income increases
        // But let's suggest waiting for a higher balance buffer
        const monthsBuffer = Math.ceil(
          totalVal / MOCK_MONTHLY_STATS.avgSurplus,
        );
        const suggestedDate = new Date();
        suggestedDate.setMonth(currentMonth + monthsBuffer);
        suggestedMonth = suggestedDate.getMonth();
        suggestedYear = suggestedDate.getFullYear();
      } else {
        const monthsBuffer = Math.ceil(
          (totalVal +
            MOCK_MONTHLY_STATS.avgExpenses -
            MOCK_MONTHLY_STATS.currentBalance) /
            MOCK_MONTHLY_STATS.avgSurplus,
        );
        const suggestedDate = new Date();
        suggestedDate.setMonth(currentMonth + monthsBuffer);
        suggestedMonth = suggestedDate.getMonth();
        suggestedYear = suggestedDate.getFullYear();
      }
    }

    return {
      isComfortable,
      balanceAfterPurchase,
      suggestedMonth,
      suggestedYear,
    };
  };

  const handleAddPlan = () => {
    if (!itemName || !totalValue || !installments) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    const newPlan: FuturePlan = {
      id: Math.random().toString(36).substr(2, 9),
      itemName,
      totalValue: parseFloat(totalValue),
      installments: parseInt(installments),
      plannedMonth: parseInt(plannedMonth),
      plannedYear: parseInt(plannedYear),
      status: "pending",
    };

    setPlans([...plans, newPlan]);
    setIsDialogOpen(false);
    resetForm();
    toast.success("Plano de compra adicionado!");
  };

  const resetForm = () => {
    setItemName("");
    setTotalValue("");
    setInstallments("1");
    setPlannedMonth(new Date().getMonth().toString());
    setPlannedYear(new Date().getFullYear().toString());
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Planos para o Futuro
          </h1>
          <p className="text-muted-foreground">
            Planeje suas próximas conquistas com base na sua saúde financeira.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Novo Plano
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Novo Plano de Compra</DialogTitle>
              <DialogDescription>
                Simule uma compra futura para ver como ela afeta seu saldo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  O que deseja comprar?
                </label>
                <Input
                  placeholder="Ex: Novo Smartphone, Viagem..."
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Valor Total</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={totalValue}
                    onChange={(e) => setTotalValue(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Parcelas</label>
                  <Input
                    type="number"
                    min="1"
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Mês Pretendido</label>
                  <Select value={plannedMonth} onValueChange={setPlannedMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m, idx) => (
                        <SelectItem key={m} value={idx.toString()}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Ano</label>
                  <Select value={plannedYear} onValueChange={setPlannedYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleAddPlan}
              >
                Simular
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2 px-1">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar planos..."
            className="pl-9 bg-card"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlans.map((plan) => {
          const comfort = calculateComfort(
            plan.totalValue,
            plan.installments,
            plan.plannedMonth,
            plan.plannedYear,
          );

          return (
            <Card
              key={plan.id}
              className="border-none shadow-sm hover:shadow-md transition-all duration-200 bg-card/50 backdrop-blur-md overflow-hidden flex flex-col"
            >
              <div className="p-5 flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-lg leading-tight">
                      {plan.itemName}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -mr-2 -mt-2"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">
                    Valor Total
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(plan.totalValue)}
                  </p>
                  {plan.installments > 1 && (
                    <p className="text-xs text-muted-foreground">
                      {plan.installments}x de{" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(plan.totalValue / plan.installments)}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1 tracking-wider">
                      Mês Pretendido
                    </p>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>
                        {MONTHS[plan.plannedMonth].slice(0, 3)} /{" "}
                        {plan.plannedYear}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1 tracking-wider">
                      Sugerido
                    </p>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>
                        {MONTHS[comfort.suggestedMonth].slice(0, 3)} /{" "}
                        {comfort.suggestedYear}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2 tracking-wider">
                    Conforto
                  </p>
                  {comfort.isComfortable ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0.5 text-[11px] gap-1 w-fit">
                      <CheckCircle2 className="h-3 w-3" /> Confortável
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0.5 text-[11px] gap-1 w-fit"
                    >
                      <Clock className="h-3 w-3" /> Planejar
                    </Badge>
                  )}
                </div>
              </div>

              <div className="bg-secondary/30 p-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Saldo Estimado
                    </p>
                    <h4
                      className={cn(
                        "text-lg font-bold",
                        comfort.balanceAfterPurchase > 0
                          ? "text-emerald-600"
                          : "text-rose-600",
                      )}
                    >
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(comfort.balanceAfterPurchase)}
                    </h4>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground italic leading-tight">
                      Após a compra
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredPlans.length === 0 && (
          <div className="p-12 text-center border-2 border-dashed rounded-3xl bg-card/30">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-1">Nenhum plano futuro</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Comece a simular seus sonhos e veja quando é o melhor momento para
              realizá-los.
            </p>
            <Button
              variant="outline"
              className="mt-6 gap-2"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="h-4 w-4" /> Criar Primeiro Plano
            </Button>
          </div>
        )}
      </div>

      <Card className="bg-emerald-600 text-white border-none shadow-xl">
        <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="bg-white/20 p-4 rounded-2xl">
            <Lightbulb className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2 flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold">Como funciona a análise?</h3>
            <p className="text-emerald-100 text-sm leading-relaxed max-w-2xl">
              Nosso sistema analisa sua <strong>sobra mensal média</strong> e
              seu <strong>saldo atual</strong>. Uma compra é considerada
              confortável se a parcela (ou o valor total) não comprometer mais
              de 40% da sua sobra mensal e se você mantiver uma reserva de
              segurança após a aquisição.
            </p>
          </div>
          <Button
            variant="secondary"
            className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold shrink-0"
          >
            Saiba Mais
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
