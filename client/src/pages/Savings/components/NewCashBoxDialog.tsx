import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";

interface NewCashBoxDialogProps {
  onSubmit: (box: { nome: string; descricao: string; saldo: number }) => void;
}

export function NewCashBoxDialog({ onSubmit }: NewCashBoxDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [saldo, setSaldo] = useState("");

  const resetForm = () => {
    setNome("");
    setDescricao("");
    setSaldo("");
  };

  const handleSubmit = () => {
    onSubmit({
      nome: nome || "Nova Caixinha",
      descricao,
      saldo: parseFloat(saldo || "0"),
    });
    setIsOpen(false);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nova Caixinha
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Caixinha</DialogTitle>
          <DialogDescription>
            Defina um nome e um objetivo para seu dinheiro.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Nome da Caixinha</label>
            <Input
              placeholder="Ex: Reforma da Casa, Troca de Carro"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Descrição</label>
            <Input
              placeholder="Para que serve esse dinheiro?"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">
              Saldo Inicial (Opcional)
            </label>
            <Input
              type="number"
              placeholder="0.00"
              value={saldo}
              onChange={(e) => setSaldo(e.target.value)}
            />
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
            Criar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
