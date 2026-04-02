import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Plus } from "lucide-react";

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
  // Form states
  cardName: string;
  setCardName: (name: string) => void;
  cardLimit: string;
  setCardLimit: (limit: string) => void;
  cardDueDay: string;
  setCardDueDay: (day: string) => void;
  cardClosingDay: string;
  setCardClosingDay: (day: string) => void;
  cardColor: string;
  setCardColor: (color: string) => void;
  tpPerson: string;
  setTpPerson: (person: string) => void;
  tpDesc: string;
  setTpDesc: (desc: string) => void;
  tpAmount: string;
  setTpAmount: (amount: string) => void;
  tpInstallments: string;
  setTpInstallments: (installments: string) => void;
  tpCardId: string;
  setTpCardId: (id: string) => void;
  // Handlers
  handleAddCard: () => void;
  handleAddThirdParty: () => void;
  resetForms: () => void;
  cards: any[];
}

export function AddCardOrThirdPartyDialog({
  isOpen,
  onOpenChange,
  addType,
  setAddType,
  cardName,
  setCardName,
  cardLimit,
  setCardLimit,
  cardDueDay,
  setCardDueDay,
  cardClosingDay,
  setCardClosingDay,
  cardColor,
  setCardColor,
  tpPerson,
  setTpPerson,
  tpDesc,
  setTpDesc,
  tpAmount,
  setTpAmount,
  tpInstallments,
  setTpInstallments,
  tpCardId,
  setTpCardId,
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
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="Ex: Nubank, Inter, Visa..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="card-limit">Limite Total</Label>
                  <Input
                    id="card-limit"
                    type="number"
                    value={cardLimit}
                    onChange={(e) => setCardLimit(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Cor</Label>
                  <Select value={cardColor} onValueChange={setCardColor}>
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
                    value={cardDueDay}
                    onChange={(e) => setCardDueDay(e.target.value)}
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
                    value={cardClosingDay}
                    onChange={(e) => setCardClosingDay(e.target.value)}
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
                  value={tpPerson}
                  onChange={(e) => setTpPerson(e.target.value)}
                  placeholder="Quem comprou?"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tp-desc">Descrição do Item</Label>
                <Input
                  id="tp-desc"
                  value={tpDesc}
                  onChange={(e) => setTpDesc(e.target.value)}
                  placeholder="O que foi comprado?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tp-amount">Valor Total</Label>
                  <Input
                    id="tp-amount"
                    type="number"
                    value={tpAmount}
                    onChange={(e) => setTpAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tp-installments">Parcelas</Label>
                  <Input
                    id="tp-installments"
                    type="number"
                    value={tpInstallments}
                    onChange={(e) => setTpInstallments(e.target.value)}
                    placeholder="Ex: 10"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Cartão Utilizado</Label>
                <Select value={tpCardId} onValueChange={setTpCardId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cartão" />
                  </SelectTrigger>
                  <SelectContent>
                    {cards.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
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
