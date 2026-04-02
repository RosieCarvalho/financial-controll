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
import { FuturePlan } from "@shared/api";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

interface NewPlanDialogProps {
  onSubmit: (plan: Partial<FuturePlan>) => void;
}

export function NewPlanDialog({ onSubmit }: NewPlanDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [totalValue, setTotalValue] = useState("");
  const [installments, setInstallments] = useState("1");
  const [plannedMonth, setPlannedMonth] = useState(
    new Date().getMonth().toString(),
  );
  const [plannedYear, setPlannedYear] = useState(
    new Date().getFullYear().toString(),
  );

  const resetForm = () => {
    setItemName("");
    setTotalValue("");
    setInstallments("1");
    setPlannedMonth(new Date().getMonth().toString());
    setPlannedYear(new Date().getFullYear().toString());
  };

  const handleSubmit = () => {
    if (!itemName || !totalValue || !installments) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    onSubmit({
      itemName,
      totalValue: parseFloat(totalValue),
      installments: parseInt(installments),
      plannedMonth: parseInt(plannedMonth),
      plannedYear: parseInt(plannedYear),
      status: "pending",
    });

    setIsOpen(false);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Novo Plano
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Plano de Compra</DialogTitle>
          <DialogDescription>
            Simule uma compra futura para ver como ela afeta seu saldo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">O que deseja comprar?</label>
            <Input
              placeholder="Ex: Novo Smartphone, Viagem..."
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Valor Total</label>
              <Input
                type="number"
                placeholder="0.00"
                value={totalValue}
                onChange={(e) => setTotalValue(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Parcelas</label>
              <Input
                type="number"
                min="1"
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Mês Pretendido</label>
              <Select value={plannedMonth} onValueChange={setPlannedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, idx) => (
                    <SelectItem key={m} value={idx.toString()}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Ano</label>
              <Select value={plannedYear} onValueChange={setPlannedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
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
            Simular
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
