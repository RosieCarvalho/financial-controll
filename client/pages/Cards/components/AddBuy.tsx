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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";
import { createTransaction } from "@/lib/api";
export function AddBuy({ card }: any) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPurchase, setNewPurchase] = useState({
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    type: "one-time" as "one-time" | "installment",
    installments: "1",
  });

  const handleAddPurchase = () => {
    if (!newPurchase.description || !newPurchase.amount) {
      toast.error("Preencha a descrição e o valor!");
      return;
    }

    const item = {
      description: newPurchase.description,
      valor: parseFloat(newPurchase.amount || "0"),
      data: newPurchase.date,
      // category_id: "3", -- arrumar isso
      tipo: newPurchase.type,
      status: "pending",
      cartao_id: card.id,
      parcela_atual: newPurchase.type === "installment" ? 1 : undefined,
      parcelas_total:
        newPurchase.type === "installment"
          ? parseInt(newPurchase.installments)
          : undefined,
    };

    // // optimistic update locally
    // const localItem: any = {
    //   id: Math.random().toString(36).substr(2, 9),
    //   description: newPurchase.description,
    //   amount: parseFloat(newPurchase.amount),
    //   date: newPurchase.date,
    //   categoryId: "3",
    //   type: newPurchase.type,
    //   status: "pending",
    //   cardId: id,
    //   currentInstallment: newPurchase.type === "installment" ? 1 : undefined,
    //   installmentsTotal:
    //     newPurchase.type === "installment"
    //       ? parseInt(newPurchase.installments)
    //       : undefined,
    // };

    // setPurchases([...purchases, localItem]);
    createTransaction(item).catch(() => {
      toast.error("Erro ao adicionar compra!");
    });
    setIsDialogOpen(false);
    setNewPurchase({
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      type: "one-time",
      installments: "1",
    });
    toast.success("Compra adicionada com sucesso!");
  };
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Plus className="h-4 w-4" /> Adicionar Compra
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Compra</DialogTitle>
          <DialogDescription>
            Registre uma nova compra no cartão {card?.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Descrição</label>
            <Input
              placeholder="Ex: Supermercado, Amazon, etc."
              value={newPurchase.description}
              onChange={(e) =>
                setNewPurchase({
                  ...newPurchase,
                  description: e.target.value,
                })
              }
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
                value={newPurchase.amount}
                onChange={(e) =>
                  setNewPurchase({
                    ...newPurchase,
                    amount: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Data</label>
              <Input
                type="date"
                value={newPurchase.date}
                onChange={(e) =>
                  setNewPurchase({
                    ...newPurchase,
                    date: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={newPurchase.type}
                onValueChange={(v: "one-time" | "installment") =>
                  setNewPurchase({ ...newPurchase, type: v })
                }
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
            {newPurchase.type === "installment" && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">Total Parcelas</label>
                <Input
                  type="number"
                  placeholder="Ex: 12"
                  value={newPurchase.installments}
                  onChange={(e) =>
                    setNewPurchase({
                      ...newPurchase,
                      installments: e.target.value,
                    })
                  }
                />
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleAddPurchase}
          >
            Salvar Compra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
