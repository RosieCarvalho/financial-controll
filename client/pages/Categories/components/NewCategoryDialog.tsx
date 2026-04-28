import { useState } from "react";
import { Plus, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Category } from "@shared/api";

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

interface NewCategoryDialogProps {
  onSubmit: (category: Partial<Category>) => Promise<void>;
}

export function NewCategoryDialog({ onSubmit }: NewCategoryDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"income" | "expense">("expense");
  const [newRule, setNewRule] = useState("50");
  const [newColor, setNewColor] = useState("#059669");

  const resetForm = () => {
    setNewName("");
    setNewType("expense");
    setNewRule("50");
    setNewColor("#059669");
  };

  const handleSubmit = async () => {
    if (!newName) {
      toast.error("Por favor, preencha o nome da categoria.");
      return;
    }

    await onSubmit({
      name: newName,
      type: newType,
      rule: newRule as "50" | "30" | "10p" | "10a",
      color: newColor,
    });

    setIsOpen(false);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
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
              <label className="text-sm font-medium">Regra (50/30/10/10)</label>
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
                  <SelectItem value="10a">Ajuda ao próximo (10%)</SelectItem>
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
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSubmit}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
