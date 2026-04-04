import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { deleteTransaction } from "@/lib/api";

interface DeleteTransactionModalProps {
  transactionId: string;
  onSuccess: () => void;
}

export function DeleteTransactionModal({
  transactionId,
  onSuccess,
}: DeleteTransactionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  console.log("transactionId", transactionId);
  const deleteTransactionMutation = useMutation({
    mutationFn: () => deleteTransaction(transactionId),
    onSuccess: () => {
      toast.success("Transação excluída com sucesso!");
      onSuccess();
    },
    onError: (err) => {
      console.log(err);
      toast.error("Erro ao excluir transação.");
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Excluir Transação</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogDescription className="mb-4">
          Tem certeza que deseja excluir esta transação? Esta ação não pode ser
          desfeita.
        </DialogDescription>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteTransactionMutation.mutate()}
            disabled={deleteTransactionMutation.isPending}
          >
            {deleteTransactionMutation.isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
