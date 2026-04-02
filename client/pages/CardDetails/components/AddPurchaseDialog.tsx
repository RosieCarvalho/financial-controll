import { useState } from "react";
import { Plus } from "lucide-react";
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
import { toast } from "sonner";

interface AddPurchaseDialogProps {
  cardName: string;
  onSubmit: (purchase: {
    description: string;
    amount: number;
    date: string;
    type: "one-time" | "installment";
    installments: number;
  }) => void;
}

export function AddPurchaseDialog({
  cardName,
  onSubmit,
}: AddPurchaseDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<"one-time" | "installment">("one-time");
  const [installments, setInstallments] = useState("1");

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setType("one-time");
    setInstallments("1");
  };

  const handleSubmit = () => {
    if (!description || !amount) {
      toast.error("Preencha a descrição e o valor!");
      return;
    }

    onSubmit({
      description,
      amount: parseFloat(amount),
      date,
      type,
      installments: parseInt(installments),
    });

    setIsOpen(false);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Plus className="h-4 w-4" /> Adicionar Compra
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Compra</DialogTitle>
          <DialogDescription>
            Registre uma nova compra no cartão {cardName}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Descrição</label>
            <Input
              placeholder="Ex: Supermercado, Amazon, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Data</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={type}
                onValueChange={(v: "one-time" | "installment") => setType(v)}
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
            {type === "installment" && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">Total Parcelas</label>
                <Input
                  type="number"
                  placeholder="Ex: 12"
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                />
              </div>
            )}
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
            Salvar Compra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
