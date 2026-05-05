import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCartao } from "@/src/lib/api";

interface DeleteCardModalProps {
  cardId: string;
  onSuccess?: () => void;
}

export function DeleteCardModal({
  cardId,
  onSuccess,
  open: openProp,
  onOpenChange,
}: DeleteCardModalProps & {
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

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => deleteCartao(cardId),
    onSuccess: () => {
      toast.success("Cartão excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["cartoes"] });
      setOpen(false);
      onSuccess && onSuccess();
    },
    onError: () => {
      toast.error("Erro ao excluir cartão.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button variant="destructive" size="icon" className="h-8 w-8">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
                fill="currentColor"
              />
            </svg>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Excluir Cartão</DialogTitle>
        </DialogHeader>
        <DialogDescription className="mb-4">
          Tem certeza que deseja excluir este cartão? Esta ação não pode ser
          desfeita.
        </DialogDescription>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
