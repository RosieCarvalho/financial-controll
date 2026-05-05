import { useState, useMemo } from "react";
import { useAuth } from "@/src/components/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { getDashboard, getPlanosFuturos } from "@/src/lib/api";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertCircle,
  PiggyBank,
  ChevronDown,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Progress } from "@/src/components/ui/progress";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";

const MONTHS = [
  { value: "0", label: "Janeiro" },
  { value: "1", label: "Fevereiro" },
  { value: "2", label: "Março" },
  { value: "3", label: "Abril" },
  { value: "4", label: "Maio" },
  { value: "5", label: "Junho" },
  { value: "6", label: "Julho" },
  { value: "7", label: "Agosto" },
  { value: "8", label: "Setembro" },
  { value: "9", label: "Outubro" },
  { value: "10", label: "Novembro" },
  { value: "11", label: "Dezembro" },
];

// Dashboard and future plans are fetched from the API; no local mock data.

const StatCard = ({ title, amount, icon: Icon, trend, color }: any) => (
  <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-200 bg-card/50 backdrop-blur-md">
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <div className="mt-4">
        <h2 className="text-3xl font-bold tracking-tight">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(amount)}
        </h2>
        {trend && (
          <p
            className={cn(
              "text-xs mt-1 flex items-center gap-1",
              trend > 0 ? "text-emerald-500" : "text-rose-500",
            )}
          >
            {trend > 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(trend)}% em relação ao mês anterior
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth().toString(),
  );

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });
  const { data: planos, isLoading: planosLoading } = useQuery({
    queryKey: ["planos_futuros"],
    queryFn: getPlanosFuturos,
  });

  const filteredActivity = useMemo(() => {
    const recent = dashboard?.recentActivity ?? [];
    return recent.filter((activity: any) => {
      const date = new Date(activity.date);
      return date.getMonth().toString() === selectedMonth;
    });
  }, [selectedMonth, dashboard]);

  // Simulate monthly data changes based on selection
  const monthlySummary = useMemo(() => {
    if (dashboard)
      return {
        income: dashboard.totalIncome,
        expenses: dashboard.totalExpenses,
        balance: dashboard.balance,
        savings: 0,
      };
    return { income: 0, expenses: 0, balance: 0, savings: 0 };
  }, [dashboard]);

  const ruleData = useMemo(() => {
    // Map dashboard.ruleStats to new 50/30/10/10 buckets
    return [
      {
        name: "Essenciais (50%)",
        value: dashboard?.ruleStats?.rule50?.current ?? 0,
        limit:
          dashboard?.ruleStats?.rule50?.limit ??
          Math.max(1, dashboard?.totalIncome ?? 1) * 0.5,
        color: "#059669",
      },
      {
        name: "Desejos Pessoais (30%)",
        value: dashboard?.ruleStats?.rule30?.current ?? 0,
        limit:
          dashboard?.ruleStats?.rule30?.limit ??
          Math.max(1, dashboard?.totalIncome ?? 1) * 0.3,
        color: "#10b981",
      },
      {
        name: "Pendências Financeiras (10%)",
        value: dashboard?.ruleStats?.rule10Pendencias?.current ?? 0,
        limit:
          dashboard?.ruleStats?.rule10Pendencias?.limit ??
          Math.max(1, dashboard?.totalIncome ?? 1) * 0.1,
        color: "#f59e0b",
      },
      {
        name: "Ajuda ao Próximo (10%)",
        value: dashboard?.ruleStats?.rule10Ajuda?.current ?? 0,
        limit:
          dashboard?.ruleStats?.rule10Ajuda?.limit ??
          Math.max(1, dashboard?.totalIncome ?? 1) * 0.1,
        color: "#34d399",
      },
    ];
  }, [dashboard]);

  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bem-vindo, {user?.name ?? user?.email ?? "Usuário"}
          </h1>
          <p className="text-muted-foreground">
            Aqui está o resumo do seu controle financeiro.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/50 p-1 rounded-lg border border-emerald-100 shadow-sm">
          <Calendar className="ml-2 h-4 w-4 text-emerald-600" />
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px] border-none bg-transparent focus:ring-0">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Receita Total"
          amount={monthlySummary.income}
          icon={TrendingUp}
          trend={12}
          color="bg-emerald-500"
        />
        <StatCard
          title="Despesas Totais"
          amount={monthlySummary.expenses}
          icon={TrendingDown}
          trend={-5}
          color="bg-rose-500"
        />
        <StatCard
          title="Saldo Atual"
          amount={monthlySummary.balance}
          icon={Wallet}
          color="bg-blue-500"
        />
        <StatCard
          title="Caixinhas"
          amount={monthlySummary.savings}
          icon={PiggyBank}
          trend={8}
          color="bg-amber-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* 50/30/20 Analysis */}
        <Card className="lg:col-span-4 border-none shadow-sm bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Equilíbrio Financeiro (50/30/20) -{" "}
              {MONTHS.find((m) => m.value === selectedMonth)?.label}
            </CardTitle>
            <CardDescription>
              Acompanhe como você está distribuindo seus gastos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-4">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ruleData}
                  layout="vertical"
                  margin={{ left: 0, right: 30 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    opacity={0.3}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={100}
                    tick={{ fontSize: 12, fontWeight: 500 }}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {ruleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid gap-6">
              {ruleData.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </span>
                    <span className="text-muted-foreground">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(item.value)}{" "}
                      /{" "}
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(item.limit)}
                    </span>
                  </div>
                  <Progress
                    value={(item.value / item.limit) * 100}
                    className="h-2"
                    indicatorColor={item.color}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Cards */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Próximos Vencimentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(dashboard?.upcomingCardDues ?? []).map((card: any) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 group hover:bg-secondary transition-colors duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "p-2 rounded-full",
                        card.status === "warning"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-primary/10 text-primary",
                      )}
                    >
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{card.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Vencimento {card.due}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(card.amount)}
                    </p>
                    {card.status === "warning" && (
                      <Badge
                        variant="outline"
                        className="text-[10px] h-4 bg-amber-50 text-amber-700 border-amber-200"
                      >
                        Vence em breve
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-2" size="sm">
                Ver todos os cartões
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">
                Atividade Recente -{" "}
                {MONTHS.find((m) => m.value === selectedMonth)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredActivity.map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        activity.amount > 0
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-rose-100 text-rose-600",
                      )}
                    >
                      {activity.amount > 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{activity.desc}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString("pt-BR")} •{" "}
                        {activity.cat}
                      </p>
                    </div>
                  </div>
                  <p
                    className={cn(
                      "font-semibold",
                      activity.amount > 0
                        ? "text-emerald-600"
                        : "text-foreground",
                    )}
                  >
                    {activity.amount > 0 ? "+" : ""}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(activity.amount)}
                  </p>
                </div>
              ))}
              {filteredActivity.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">
                  Nenhuma atividade neste mês.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-primary/5 backdrop-blur-md overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Próximas Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planos ?? []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="totalValue"
                    >
                      {(planos ?? []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value: number) =>
                        new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(value)
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {(planos ?? []).map((plan: any) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: plan.color }}
                      />
                      <span className="font-medium">{plan.itemName}</span>
                    </div>
                    <span className="text-muted-foreground font-mono text-xs">
                      {MONTHS[plan.plannedMonth].label.slice(0, 3)}/
                      {plan.plannedYear}
                    </span>
                  </div>
                ))}
              </div>
              <Link to="/future-plans">
                <Button
                  variant="ghost"
                  className="w-full mt-2 text-primary gap-2"
                  size="sm"
                >
                  Ver detalhes do planejamento{" "}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
