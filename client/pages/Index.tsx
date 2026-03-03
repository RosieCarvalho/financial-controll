import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar,
  AlertCircle
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
  Pie
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const MOCK_DATA = {
  summary: {
    income: 8500,
    expenses: 4200,
    balance: 4300,
    savings: 1200
  },
  rule503020: [
    { name: 'Essenciais (50%)', value: 2500, limit: 4250, color: '#059669' },
    { name: 'Desejos (30%)', value: 1200, limit: 2550, color: '#10b981' },
    { name: 'Reserva (20%)', value: 500, limit: 1700, color: '#34d399' },
  ],
  upcomingCards: [
    { id: '1', name: 'Nubank', due: '12/10', amount: 1250.50, status: 'warning' },
    { id: '2', name: 'Inter', due: '15/10', amount: 450.20, status: 'default' },
  ],
  recentActivity: [
    { id: '1', desc: 'Mercado Livre', amount: -150.00, date: 'Hoje', cat: 'Desejos' },
    { id: '2', desc: 'Salário', amount: 5000.00, date: 'Ontem', cat: 'Renda' },
    { id: '3', desc: 'Aluguel', amount: -1800.00, date: '05/10', cat: 'Essencial' },
  ]
};

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
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}
        </h2>
        {trend && (
          <p className={cn("text-xs mt-1 flex items-center gap-1", trend > 0 ? "text-emerald-500" : "text-rose-500")}>
            {trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend)}% em relação ao mês anterior
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);

import { cn } from "@/lib/utils";

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo, Rosiene</h1>
        <p className="text-muted-foreground">Aqui está o resumo do seu controle financeiro este mês.</p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Receita Total" 
          amount={MOCK_DATA.summary.income} 
          icon={TrendingUp} 
          trend={12} 
          color="bg-emerald-500"
        />
        <StatCard 
          title="Despesas Totais" 
          amount={MOCK_DATA.summary.expenses} 
          icon={TrendingDown} 
          trend={-5} 
          color="bg-rose-500"
        />
        <StatCard 
          title="Saldo Atual" 
          amount={MOCK_DATA.summary.balance} 
          icon={Wallet} 
          color="bg-blue-500"
        />
        <StatCard 
          title="Caixinhas" 
          amount={MOCK_DATA.summary.savings} 
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
              Equilíbrio Financeiro (50/30/20)
            </CardTitle>
            <CardDescription>
              Acompanhe como você está distribuindo seus gastos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-4">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_DATA.rule503020} layout="vertical" margin={{ left: 0, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
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
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {MOCK_DATA.rule503020.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid gap-6">
              {MOCK_DATA.rule503020.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="text-muted-foreground">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)} / {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.limit)}
                    </span>
                  </div>
                  <Progress value={(item.value / item.limit) * 100} className="h-2" indicatorColor={item.color} />
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
              {MOCK_DATA.upcomingCards.map((card) => (
                <div key={card.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 group hover:bg-secondary transition-colors duration-200">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-full",
                      card.status === 'warning' ? "bg-amber-100 text-amber-600" : "bg-primary/10 text-primary"
                    )}>
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{card.name}</p>
                      <p className="text-xs text-muted-foreground">Vencimento {card.due}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.amount)}
                    </p>
                    {card.status === 'warning' && (
                      <Badge variant="outline" className="text-[10px] h-4 bg-amber-50 text-amber-700 border-amber-200">Vence em breve</Badge>
                    )}
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-2" size="sm">Ver todos os cartões</Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {MOCK_DATA.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      activity.amount > 0 ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                    )}>
                      {activity.amount > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{activity.desc}</p>
                      <p className="text-xs text-muted-foreground">{activity.date} • {activity.cat}</p>
                    </div>
                  </div>
                  <p className={cn("font-semibold", activity.amount > 0 ? "text-emerald-600" : "text-foreground")}>
                    {activity.amount > 0 ? '+' : ''}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(activity.amount)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
