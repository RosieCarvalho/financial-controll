import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/src/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Card as CardType } from "@shared/api";

const COLORS = [
  { name: "Roxo", value: "bg-purple-600" },
  { name: "Laranja", value: "bg-orange-500" },
  { name: "Azul", value: "bg-blue-600" },
  { name: "Verde", value: "bg-emerald-600" },
  { name: "Preto", value: "bg-zinc-900" },
  { name: "Vermelho", value: "bg-rose-600" },
];

interface AddCardOrThirdPartyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  addType: "card" | "third-party";
  setAddType: (type: "card" | "third-party") => void;
  form: {
    card: {
      name: string;
      limit: string;
      dueDay: string;
      closingDay: string;
      color: string;
    };
    thirdParty: {
      person: string;
      desc: string;
      amount: string;
      installments: string;
      cardId: string;
    };
  };
  setFieldValue: (path: string, value: any) => void;
  // Handlers
  handleAddCard: () => void;
  handleAddThirdParty: () => void;
  resetForms: () => void;
  cards: CardType[];
}

export function AddCardOrThirdPartyDialog({
  isOpen,
  onOpenChange,
  addType,
  setAddType,
  form,
  setFieldValue,
  handleAddCard,
  handleAddThirdParty,
  resetForms,
  cards,
}: AddCardOrThirdPartyDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center gap-2"
          onClick={() => setAddType(addType)}
        >
          <Plus className="h-4 w-4" />
          Adicionar Novo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {addType === "card" ? "Novo Cartão" : "Nova Compra de Terceiro"}
          </DialogTitle>
          <DialogDescription>
            {addType === "card"
              ? "Adicione um novo cartão de crédito para gerenciar."
              : "Registre uma compra feita por outra pessoa no seu cartão."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Tabs value={addType} onValueChange={(v) => setAddType(v as any)}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="card">Cartão</TabsTrigger>
              <TabsTrigger value="third-party">Terceiro</TabsTrigger>
            </TabsList>

            <TabsContent value="card" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="card-name">Nome do Cartão</Label>
                <Input
                  id="card-name"
                  value={form.card.name}
                  onChange={(e) => setFieldValue("card.name", e.target.value)}
                  placeholder="Ex: Nubank, Inter, Visa..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="card-limit">Limite Total</Label>
                  <Input
                    id="card-limit"
                    type="number"
                    value={form.card.limit}
                    onChange={(e) =>
                      setFieldValue("card.limit", e.target.value)
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Cor</Label>
                  <Select
                    value={form.card.color}
                    onValueChange={(v) => setFieldValue("card.color", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COLORS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className={cn("w-3 h-3 rounded-full", c.value)}
                            />
                            {c.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="due-day">Dia do Vencimento</Label>
                  <Input
                    id="due-day"
                    type="number"
                    min="1"
                    max="31"
                    value={form.card.dueDay}
                    onChange={(e) =>
                      setFieldValue("card.dueDay", e.target.value)
                    }
                    placeholder="Ex: 10"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="closing-day">Dia do Fechamento</Label>
                  <Input
                    id="closing-day"
                    type="number"
                    min="1"
                    max="31"
                    value={form.card.closingDay}
                    onChange={(e) =>
                      setFieldValue("card.closingDay", e.target.value)
                    }
                    placeholder="Ex: 03"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="third-party" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="tp-person">Nome da Pessoa</Label>
                <Input
                  id="tp-person"
                  value={form.thirdParty.person}
                  onChange={(e) =>
                    setFieldValue("thirdParty.person", e.target.value)
                  }
                  placeholder="Quem comprou?"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tp-desc">Descrição do Item</Label>
                <Input
                  id="tp-desc"
                  value={form.thirdParty.desc}
                  onChange={(e) =>
                    setFieldValue("thirdParty.desc", e.target.value)
                  }
                  placeholder="O que foi comprado?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tp-amount">Valor Total</Label>
                  <Input
                    id="tp-amount"
                    type="number"
                    value={form.thirdParty.amount}
                    onChange={(e) =>
                      setFieldValue("thirdParty.amount", e.target.value)
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tp-installments">Parcelas</Label>
                  <Input
                    id="tp-installments"
                    type="number"
                    value={form.thirdParty.installments}
                    onChange={(e) =>
                      setFieldValue("thirdParty.installments", e.target.value)
                    }
                    placeholder="Ex: 10"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Cartão Utilizado</Label>
                <Select
                  value={form.thirdParty.cardId}
                  onValueChange={(v) => setFieldValue("thirdParty.cardId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cartão" />
                  </SelectTrigger>
                  <SelectContent>
                    {cards?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForms();
            }}
          >
            Cancelar
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={addType === "card" ? handleAddCard : handleAddThirdParty}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
