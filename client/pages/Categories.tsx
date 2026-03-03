import { useState } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Tags,
  Target,
  ShoppingCart,
  Zap,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Category } from "@shared/api";

const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Aluguel', rule: '50', type: 'expense', color: '#059669' },
  { id: '2', name: 'Supermercado', rule: '50', type: 'expense', color: '#059669' },
  { id: '3', name: 'Streaming', rule: '30', type: 'expense', color: '#10b981' },
  { id: '4', name: 'Investimentos', rule: '20', type: 'expense', color: '#34d399' },
  { id: '5', name: 'Salário', rule: '50', type: 'income', color: '#0ea5e9' },
  { id: '6', name: 'Restaurantes', rule: '30', type: 'expense', color: '#10b981' },
  { id: '7', name: 'Saúde', rule: '50', type: 'expense', color: '#059669' },
];

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = MOCK_CATEGORIES.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">Gerencie as categorias de gastos e receitas do seu plano 50/30/20.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-emerald-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-emerald-700 flex items-center gap-2">
              <Zap className="h-4 w-4" /> Essenciais (50%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-800">Gastos necessários para viver: aluguel, alimentação, saúde e contas fixas.</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-emerald-100/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-emerald-800 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" /> Desejos (30%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-900">Lifestyle e lazer: assinaturas, jantares fora, hobbies e compras não essenciais.</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-emerald-200/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <Target className="h-4 w-4" /> Reserva/Dívidas (20%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-950">Seu futuro: investimentos, fundo de reserva ou pagamento de dívidas.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Listagem de Categorias</CardTitle>
              <CardDescription>Visualize e edite suas categorias de transação.</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar categoria..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Regra (50/30/20)</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat) => (
                  <TableRow key={cat.id} className="group transition-colors duration-200">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="font-medium">{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cat.type === 'income' ? 'default' : 'secondary'} className={cn(
                        "capitalize",
                        cat.type === 'income' ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-none" : ""
                      )}>
                        {cat.type === 'income' ? 'Receita' : 'Despesa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {cat.rule}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
