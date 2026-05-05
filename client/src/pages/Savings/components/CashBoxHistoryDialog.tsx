import {
  History,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { cn } from "@/src/lib/utils";
import { CashBox } from "@shared/api";

interface CashBoxHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBox: CashBox | null;
}

export function CashBoxHistoryDialog({
  isOpen,
  onOpenChange,
  selectedBox,
}: CashBoxHistoryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Movimentações: {selectedBox?.nome}
          </DialogTitle>
          <DialogDescription>
            Histórico detalhado de depósitos e resgates.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-3">
          {(selectedBox?.history ?? []).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "p-2 rounded-full",
                    item.tipo === "deposit"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-rose-100 text-rose-600",
                  )}
                >
                  {item.tipo === "deposit" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.descricao}</p>
                  <p className="text-xs text-muted-foreground">{item.data}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "font-bold",
                    item.tipo === "deposit"
                      ? "text-emerald-600"
                      : "text-rose-600",
                  )}
                >
                  {item.tipo === "deposit" ? "+" : ""}
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(item.valor)}
                </p>
                <Badge
                  variant="outline"
                  className="text-[10px] h-4 py-0 flex items-center gap-1 mt-1"
                >
                  <CheckCircle2 className="h-2 w-2" /> Efetivado
                </Badge>
              </div>
            </div>
          ))}
          {(selectedBox?.history?.length ?? 0) === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma movimentação registrada.
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
