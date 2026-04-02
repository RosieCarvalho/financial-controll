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
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Category } from "@shared/api";

interface NewTransactionDialogProps {
  categories: Category[];
  onSubmit: (transaction: {
    description: string;
    amount: number;
    date: string;
    categoryId: string;
    type: "fixed" | "one-time";
    status: "pending" | "paid" | "received";
  }) => void;
}

export function NewTransactionDialog({
  categories,
  onSubmit,
}: NewTransactionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<"fixed" | "one-time">("one-time");
  const [status, setStatus] = useState<"pending" | "paid" | "received">(
    "pending",
  );

  const resetForm = () => {
    setDesc("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setCategoryId("");
    setType("one-time");
    setStatus("pending");
  };

  // Set default status based on category type
  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    const cat = categories.find((c) => c.id === value);
    if (cat) {
      setStatus(cat.type === "income" ? "received" : "pending");
    }
  };

  const handleSubmit = () => {
    if (!desc || !amount || !date || !categoryId) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const cat = categories.find((c) => c.id === categoryId);
    const numericAmount = parseFloat(amount);
    const finalAmount =
      cat?.type === "expense"
        ? -Math.abs(numericAmount)
        : Math.abs(numericAmount);

    onSubmit({
      description: desc,
      amount: finalAmount,
      date,
      categoryId,
      type,
      status,
    });

    setIsOpen(false);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>
            Adicione uma nova receita ou despesa ao seu controle.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="desc" className="text-sm font-medium">
              Descrição
            </label>
            <Input
              id="desc"
              placeholder="Ex: Aluguel, Salário, etc."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="amount" className="text-sm font-medium">
                Valor
              </label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="date" className="text-sm font-medium">
                Data
              </label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label htmlFor="cat" className="text-sm font-medium">
              Categoria
            </label>
            <Select value={categoryId} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.rule}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Tipo</label>
            <Select value={type} onValueChange={(v: any) => setType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one-time">Único</SelectItem>
                <SelectItem value="fixed">Fixo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
              </SelectContent>
            </Select>
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
