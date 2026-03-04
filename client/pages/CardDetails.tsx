import { useParams, Link } from "react-router-dom";
import { useState } from "react";
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
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Transaction, CreditCard as CreditCardType } from "@shared/api";
import { toast } from "sonner";

const MOCK_CARDS: CreditCardType[] = [
  { id: '1', name: 'Nubank', limit: 15000, currentInvoice: 2500.50, dueDay: 12, closingDay: 5, color: 'bg-purple-600' },
  { id: '2', name: 'Inter', limit: 5000, currentInvoice: 1200.20, dueDay: 15, closingDay: 8, color: 'bg-orange-500' },
];

const MOCK_PURCHASES: Transaction[] = [
  { id: 'p1', description: 'Monitor Gamer', amount: 150.00, date: '2023-10-01', categoryId: '3', type: 'installment', status: 'pending', cardId: '1', currentInstallment: 3, installmentsTotal: 10 },
  { id: 'p2', description: 'Supermercado', amount: 450.25, date: '2023-10-05', categoryId: '2', type: 'one-time', status: 'pending', cardId: '1' },
  { id: 'p3', description: 'Netflix', amount: 55.90, date: '2023-10-08', categoryId: '3', type: 'one-time', status: 'pending', cardId: '1' },
  { id: 'p4', description: 'Tênis Corrida', amount: 175.00, date: '2023-09-05', categoryId: '4', type: 'installment', status: 'pending', cardId: '2', currentInstallment: 2, installmentsTotal: 2 },
];

export default function CardDetails() {
  const { id } = useParams();
  const card = MOCK_CARDS.find(c => c.id === id);
  const [purchases, setPurchases] = useState<Transaction[]>(MOCK_PURCHASES.filter(p => p.cardId === id));

  if (!card) return <div className="p-8">Cartão não encontrado.</div>;

  const totalInvoice = purchases.reduce((acc, p) => acc + p.amount, 0);

  const handlePayInvoice = () => {
    // Rule: "ao pagar só abate o que é parcela unica ou q é ultima parcela"
    // Abater here means removing it from the tracking list or marking it finished
    const newPurchases = purchases.filter(p => {
      // Keep only if it's NOT a one-time and NOT the last installment
      const isOneTime = p.type === 'one-time';
      const isLastInstallment = p.type === 'installment' && p.currentInstallment === p.installmentsTotal;
      return !isOneTime && !isLastInstallment;
    });

    // For installments that are NOT the last, we'd increment the installment in a real app, 
    // but here we'll just simulate the clearing logic the user requested.
    setPurchases(newPurchases);
    toast.success("Fatura paga! Itens de parcela única e últimas parcelas foram liquidados.");
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
              <div className={cn("p-2 rounded-lg text-white shadow-md", card.color)}>
                <CreditCard className="h-6 w-6" />
              </div>
              {card.name}
            </h1>
            <p className="text-muted-foreground">Fatura atual com vencimento dia {card.dueDay}.</p>
          </div>
        </div>
        <Button onClick={handlePayInvoice} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg">
          Pagar Fatura Total
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Total da Fatura</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalInvoice)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Limite Disponível</CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-600">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.limit - totalInvoice)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider">Status</CardDescription>
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
              <CardDescription>Detalhamento de todos os itens parcelados e compras únicas.</CardDescription>
            </div>
            <Button size="sm" variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Adicionar Compra
            </Button>
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
                {purchases.map((p) => (
                  <TableRow key={p.id} className="group hover:bg-secondary/20 transition-colors">
                    <TableCell>
                      <div className="font-medium">{p.description}</div>
                      {p.type === 'installment' && (
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Layers className="h-3 w-3" />
                          Parcela {p.currentInstallment} de {p.installmentsTotal}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {p.type === 'one-time' ? 'Compra Única' : 'Parcelado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(p.date).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.amount)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {purchases.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
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
              Itens marcados como **Parcelado** continuarão aparecendo nas próximas faturas até que a última parcela seja paga. Somente na última parcela o item será removido do controle.
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
