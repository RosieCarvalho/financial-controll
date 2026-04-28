import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCategoria } from "@/lib/api";
import { Category } from "@shared/api";
import { cn } from "@/lib/utils";
import { Palette } from "lucide-react";

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

interface EditCategoryDialogProps {
  category: Category;
  trigger?: React.ReactNode;
}

export function EditCategoryDialog({
  category,
  trigger,
  open: openProp,
  onOpenChange,
}: EditCategoryDialogProps & {
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}) {
  const isControlled = typeof openProp !== "undefined";
  const [openInternal, setOpenInternal] = useState(false);
  const open = isControlled ? openProp! : openInternal;
  const setOpen = (v: boolean) => {
    if (isControlled) onOpenChange && onOpenChange(v);
    else setOpenInternal(v);
  };

  const [form, setForm] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    rule: "50" as "50" | "30" | "10p" | "10a",
    color: "#059669",
  });

  useEffect(() => {
    if (!category) return;
    if (open) {
      setForm({
        name: category.name || "",
        type: (category.type as "income" | "expense") || "expense",
        rule: (category.rule as "50" | "30" | "10p" | "10a") || "50",
        color: category.color || "#059669",
      });
    }
  }, [category, open]);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => updateCategoria(category.id, form),
    onSuccess: () => {
      toast.success("Categoria atualizada");
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      setOpen(false);
    },
    onError: () => toast.error("Erro ao atualizar categoria"),
  });

  const handleChange = (key: keyof typeof form, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSave = () => {
    if (!form.name) {
      toast.error("Preencha o nome da categoria");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
                  fill="currentColor"
                />
                <path
                  d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                  fill="currentColor"
                />
              </svg>
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
          <DialogDescription>Atualize os dados da categoria.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Nome</label>
            <Input
              placeholder="Ex: Farmácia, Academia, etc."
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={form.type}
                onValueChange={(v: any) => handleChange("type", v)}
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
              <label className="text-sm font-medium">Regra (50/30/10/10)</label>
              <Select
                value={form.rule}
                onValueChange={(v: any) => handleChange("rule", v)}
                disabled={form.type === "income"}
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
                  onClick={() => handleChange("color", color.value)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all duration-200",
                    form.color === color.value
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
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSave}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
