import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategorias } from "@/src/lib/api";
import {
  Plus,
  Search,
  Tags,
  Target,
  ShoppingCart,
  Zap,
  Briefcase,
  Palette,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/src/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Category } from "@shared/api";
import { createCategoria } from "@/src/lib/api";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";
import { DeleteCategoryModal } from "./Categories/components/DeleteCategoryModal";
import { EditCategoryDialog } from "./Categories/components/EditCategoryDialog";

// Use API-provided categories only; remove local mock data.

const COLOR_OPTIONS = [
  { name: "Emerald", value: "#059669" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Purple", value: "#a855f7" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Gray", value: "#6b7280" },
];

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: categoriesData } = useQuery({
    queryKey: ["categorias"],
    queryFn: getCategorias,
  });
  const [categories, setCategories] = useState<Category[]>(
    categoriesData ?? [],
  );
  useEffect(() => {
    if (categoriesData) setCategories(categoriesData as any);
  }, [categoriesData]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"income" | "expense">("expense");
  const [newRule, setNewRule] = useState("50");
  const [newColor, setNewColor] = useState("#059669");

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddCategory = async () => {
    if (!newName) {
      toast.error("Por favor, preencha o nome da categoria.");
      return;
    }

    const payload: Partial<Category> = {
      name: newName,
      type: newType,
      rule: newRule as "50" | "30" | "10p" | "10a",
      color: newColor,
    };

    try {
      const created = await createCategoria(payload);
      // API returns the created category; append to local state
      setCategories((prev) => [...prev, created]);
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      setIsDialogOpen(false);
      resetForm();
      toast.success("Categoria adicionada com sucesso!");
    } catch (err: any) {
      toast.error("Erro ao salvar categoria: " + (err?.message ?? String(err)));
    }
  };

  const resetForm = () => {
    setNewName("");
    setNewType("expense");
    setNewRule("50");
    setNewColor("#059669");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
            Gerencie as categorias de gastos e receitas do seu plano 50/30/20.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Nova Categoria</DialogTitle>
              <DialogDescription>
                Crie uma nova categoria para organizar suas transações.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Nome</label>
                <Input
                  placeholder="Ex: Farmácia, Academia, etc."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <Select
                    value={newType}
                    onValueChange={(v: any) => setNewType(v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Regra (50/30/10/10)
                  </label>
                  <Select
                    value={newRule}
                    onValueChange={setNewRule}
                    disabled={newType === "income"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">Essenciais (50%)</SelectItem>
                      <SelectItem value="30">Desejos (30%)</SelectItem>
                      <SelectItem value="10p">Pendências (10%)</SelectItem>
                      <SelectItem value="10a">
                        Ajuda ao próximo (10%)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4" /> Cor da Categoria
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewColor(color.value)}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all duration-200",
                        newColor === color.value
                          ? "border-primary scale-110 shadow-md"
                          : "border-transparent hover:scale-105",
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleAddCategory}
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-sm bg-emerald-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-emerald-700 flex items-center gap-2">
              <Zap className="h-4 w-4" /> Essenciais (50%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-800">
              Gastos necessários para viver: aluguel, alimentação, saúde e
              contas fixas.
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-emerald-100/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-emerald-800 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" /> Desejos (30%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-900">
              Lifestyle e lazer: assinaturas, jantares fora, hobbies e compras
              não essenciais.
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-emerald-200/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <Target className="h-4 w-4" /> Reserva/Dívidas (10%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-950">
              Seu futuro: investimentos, fundo de reserva ou pagamento de
              dívidas.
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-emerald-200/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <Target className="h-4 w-4" /> Ao próximo (10%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-emerald-950">Ajuda ao próximo</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-card/50 backdrop-blur-md">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Listagem de Categorias</CardTitle>
              <CardDescription>
                Visualize e edite suas categorias de transação.
              </CardDescription>
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
                  <TableRow
                    key={cat.id}
                    className="group transition-colors duration-200"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-medium">{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          cat.type === "income" ? "default" : "secondary"
                        }
                        className={cn(
                          "capitalize",
                          cat.type === "income"
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-none"
                            : "",
                        )}
                      >
                        {cat.type === "income" ? "Receita" : "Despesa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {cat.rule}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <EditCategoryDialog category={cat} />
                        <DeleteCategoryModal categoryId={cat.id} />
                      </div>
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
