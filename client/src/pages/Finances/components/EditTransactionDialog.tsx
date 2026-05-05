import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTransaction } from "@/src/lib/api";
import { Category, TransactionBD } from "@shared/api";

interface EditTransactionDialogProps {
  transaction: any;
  categories: Category[];
  trigger?: React.ReactNode;
}

export default function EditTransactionDialog({
  transaction,
  categories,
  trigger,
  open: openProp,
  onOpenChange,
}: EditTransactionDialogProps & {
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

  const [form, setForm] = useState<{
    desc: string;
    amount: string;
    date: string;
    categoryId: string;
    type: "fixed" | "one-time";
    status: "pending" | "paid" | "received";
  }>({
    desc: "",
    amount: "",
    date: "",
    categoryId: "",
    type: "one-time",
    status: "pending",
  });

  const handleFormChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!transaction) return;
    // populate fields when dialog opens or transaction changes
    if (open) {
      setForm({
        desc: transaction.description,
        amount: transaction.amount.toString(),
        date: transaction.date,
        categoryId: transaction.categoryId,
        type: transaction.type,
        status: transaction.status,
      });
    }
  }, [transaction, open]);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (payload: TransactionBD) => updateTransaction(payload),
    onSuccess: () => {
      toast.success("Transação atualizada");
      queryClient.invalidateQueries({ queryKey: ["transacoes"] });
      setOpen(false);
    },
    onError: () => toast.error("Erro ao atualizar transação"),
  });

  useEffect(() => {
    if (!transaction) return;
    // populate fields when dialog opens or transaction changes
    if (open) {
      setForm({
        desc: transaction.description || transaction.descricao || "",
        amount: String(Math.abs(transaction.amount ?? 0)),
        date: (
          transaction.date ||
          transaction.data ||
          new Date().toISOString()
        ).split("T")[0],
        categoryId: transaction.categoryId || "",
        type: transaction.type === "fixed" ? "fixed" : "one-time",
        status: transaction.status || "pending",
      });
    }
  }, [transaction, open]);
  const getCategoryType = (categories: Category[], categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.type ?? "";
  };

  const handleSave = () => {
    if (!form.desc || !form.amount || !form.date || !form.categoryId) {
      toast.error("Preencha todos os campos");
      return;
    }
    const numeric = parseFloat(form.amount || "0");
    const payload: any = {
      id: transaction.id,
      descricao: form.desc,
      valor:
        getCategoryType(categories, form.categoryId) === "expense"
          ? -Math.abs(numeric)
          : Math.abs(numeric),
      data: form.date,
      categoria_id: form.categoryId,
      tipo: form.type,
      status: form.status,
    };

    mutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="icon">
              ...
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Transação</DialogTitle>
          <DialogDescription>Atualize os dados da transação.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Descrição</label>
            <Input
              value={form.desc}
              onChange={(e) => handleFormChange("desc", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Valor</label>
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => handleFormChange("amount", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Data</label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => handleFormChange("date", e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Categoria</label>
            <Select
              value={form.categoryId}
              onValueChange={(v) => handleFormChange("categoryId", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Tipo</label>
            <Select
              value={form.type}
              onValueChange={(v: any) => handleFormChange("type", v)}
            >
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
            <Select
              value={form.status}
              onValueChange={(v: any) => handleFormChange("status", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="received">Recebido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
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
