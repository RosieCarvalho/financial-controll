import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CashBox } from "@shared/api";

interface CashBoxTransactionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBox: CashBox | null;
  txType: "deposit" | "withdrawal";
  onSubmit: (amount: number, description: string) => void;
}

export function CashBoxTransactionDialog({
  isOpen,
  onOpenChange,
  selectedBox,
  txType,
  onSubmit,
}: CashBoxTransactionDialogProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!selectedBox || !amount || parseFloat(amount) <= 0) return;

    const numAmount = parseFloat(amount);

    if (txType === "withdrawal" && selectedBox.balance < numAmount) {
      toast.error("Saldo insuficiente na caixinha!");
      return;
    }

    onSubmit(numAmount, description);
    setAmount("");
    setDescription("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {txType === "deposit" ? "Guardar Dinheiro" : "Resgatar Dinheiro"}
          </DialogTitle>
          <DialogDescription>
            {selectedBox?.name} • Saldo:{" "}
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(selectedBox?.balance || 0)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Valor</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                type="number"
                placeholder="0.00"
                className="pl-9"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Descrição (Opcional)</label>
            <Input
              placeholder="Ex: Aporte mensal, Conserto..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="sm:justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className={cn(
              "text-white shadow-md",
              txType === "deposit"
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-rose-600 hover:bg-rose-700",
            )}
            onClick={handleSubmit}
          >
            Confirmar {txType === "deposit" ? "Depósito" : "Resgate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
