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
import { updateCartao } from "@/src/lib/api";

interface EditCardDialogProps {
  card: any;
  trigger?: React.ReactNode;
}

export function EditCardDialog({
  card,
  trigger,
  open: openProp,
  onOpenChange,
}: EditCardDialogProps & {
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
    nome: "",
    limite: "",
    dia_fechamento: "",
    dia_vencimento: "",
    cor: "bg-purple-600",
  });

  useEffect(() => {
    if (!card) return;
    if (open) {
      setForm({
        nome: card.nome || "",
        limite: String(card.limite ?? ""),
        dia_fechamento: String(card.dia_fechamento ?? ""),
        dia_vencimento: String(card.dia_vencimento ?? ""),
        cor: card.cor || "bg-purple-600",
      });
    }
  }, [card, open]);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => updateCartao(card.id, form),
    onSuccess: () => {
      toast.success("Cartão atualizado");
      queryClient.invalidateQueries({ queryKey: ["cartoes"] });
      setOpen(false);
    },
    onError: () => toast.error("Erro ao atualizar cartão"),
  });

  const handleChange = (key: keyof typeof form, value: string) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSave = () => {
    if (!form.nome || !form.limite) {
      toast.error("Preencha nome e limite");
      return;
    }
    mutation.mutate();
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
          <DialogTitle>Editar Cartão</DialogTitle>
          <DialogDescription>Atualize os dados do cartão.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Nome</label>
            <Input
              value={form.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Limite</label>
              <Input
                type="number"
                value={form.limite}
                onChange={(e) => handleChange("limite", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Vencimento (dia)</label>
              <Input
                type="number"
                value={form.dia_vencimento}
                onChange={(e) => handleChange("dia_vencimento", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Dia do Fechamento</label>
            <Input
              type="number"
              value={form.dia_fechamento}
              onChange={(e) => handleChange("dia_fechamento", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Cor</label>
            <Select
              value={form.cor}
              onValueChange={(v) => handleChange("cor", v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bg-purple-600">Roxo</SelectItem>
                <SelectItem value="bg-orange-500">Laranja</SelectItem>
                <SelectItem value="bg-blue-600">Azul</SelectItem>
                <SelectItem value="bg-emerald-600">Verde</SelectItem>
                <SelectItem value="bg-zinc-900">Preto</SelectItem>
                <SelectItem value="bg-rose-600">Vermelho</SelectItem>
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

export default EditCardDialog;
