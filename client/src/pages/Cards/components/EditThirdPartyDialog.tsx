import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCompraTerceiro } from "@/src/lib/api";

export function EditThirdPartyDialog({
  compra,
  trigger,
  open: openProp,
  onOpenChange,
}: any & { open?: boolean; onOpenChange?: (v: boolean) => void }) {
  const isControlled = typeof openProp !== "undefined";
  const [openInternal, setOpenInternal] = useState(false);
  const isOpen = isControlled ? openProp! : openInternal;
  const setOpen = (v: boolean) => {
    if (isControlled) onOpenChange && onOpenChange(v);
    else setOpenInternal(v);
  };

  const [form, setForm] = useState(() => ({
    descricao: compra?.descricao || "",
    valor: compra?.valor?.toString() || "",
    data:
      compra?.data?.split("T")?.[0] || new Date().toISOString().split("T")[0],
  }));

  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setForm({
        descricao: compra?.descricao || "",
        valor: compra?.valor?.toString() || "",
        data:
          compra?.data?.split("T")?.[0] ||
          new Date().toISOString().split("T")[0],
      });
    }
  }, [isOpen, compra]);

  const updateThirdPartyPurchase = useMutation({
    mutationFn: async (payload: any) => {
      return await updateCompraTerceiro(payload.id, payload);
    },
    onSuccess: () => {
      toast.success("Compra atualizada");
      queryClient.invalidateQueries({ queryKey: ["compras_terceiros"] });
      setOpen(false);
    },
    onError: () => {
      toast.error("Erro ao atualizar compra");
    },
  });

  const handleSave = async () => {
    if (!form.descricao || !form.valor) {
      toast.error("Preencha descri o e valor");
      return;
    }

    updateThirdPartyPurchase.mutate({
      id: compra.id,
      descricao: form.descricao,
      valor: parseFloat(form.valor || "0"),
      data: form.data,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="icon">
              ...
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Compra Terceirizada</DialogTitle>
          <DialogDescription>Edite a compra de terceiro.</DialogDescription>
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

export default EditThirdPartyDialog;
