import { useState, useEffect } from "react";
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
import { updateTransaction } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

export function EditBuy({
  transaction,
  cardId,
  trigger,
  open: openProp,
  onOpenChange,
}: any & { open?: boolean; onOpenChange?: (v: boolean) => void }) {
  const isControlled = typeof openProp !== "undefined";
  const [openInternal, setOpenInternal] = useState(false);
  const isOpen = isControlled ? openProp! : openInternal;
  const setIsOpen = (v: boolean) => {
    if (isControlled) onOpenChange && onOpenChange(v);
    else setOpenInternal(v);
  };
  const [form, setForm] = useState(() => ({
    descricao: transaction?.descricao || "",
    valor: transaction?.valor?.toString() || "",
    data:
      transaction?.data?.split("T")?.[0] ||
      new Date().toISOString().split("T")[0],
    tipo: transaction?.tipo || "one-time",
    parcelas_total: transaction?.parcelas_total?.toString() || "1",
    parcela_atual: transaction?.parcela_atual?.toString() || "1",
  }));

  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setForm({
        descricao: transaction?.descricao || "",
        valor: transaction?.valor?.toString() || "",
        data:
          transaction?.data?.split("T")?.[0] ||
          new Date().toISOString().split("T")[0],
        tipo: transaction?.tipo || "one-time",
        parcelas_total: transaction?.parcelas_total?.toString() || "1",
        parcela_atual: transaction?.parcela_atual?.toString() || "1",
      });
    }
  }, [isOpen, transaction]);

  const handleSave = async () => {
    if (!form.descricao || !form.valor) {
      toast.error("Preencha descrição e valor");
      return;
    }
    const payload: any = {
      id: transaction.id,
      descricao: form.descricao,
      valor: parseFloat(form.valor || "0"),
      data: form.data,
      tipo: form.tipo,
      parcelas_total:
        form.tipo === "installment"
          ? parseInt(form.parcelas_total || "1")
          : null,
      parcela_atual:
        form.tipo === "installment"
          ? parseInt(form.parcela_atual || "1")
          : null,
    };

    try {
      await updateTransaction(payload);
      toast.success("Compra atualizada");
      queryClient.invalidateQueries({ queryKey: ["fatura_cartao", cardId] });
      setIsOpen(false);
    } catch (err) {
      toast.error("Erro ao atualizar compra");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ...
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Compra</DialogTitle>
          <DialogDescription>
            Edite os dados da compra selecionada.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Descrição</label>
            <Input
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Valor</label>
              <Input
                type="number"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Data</label>
              <Input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={form.tipo}
                onValueChange={(v: any) => setForm({ ...form, tipo: v })}
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
            {form.tipo === "installment" && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">Total Parcelas</label>
                <Input
                  type="number"
                  value={form.parcelas_total}
                  onChange={(e) =>
                    setForm({ ...form, parcelas_total: e.target.value })
                  }
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
            onClick={handleSave}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditBuy;
