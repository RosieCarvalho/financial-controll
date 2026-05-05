import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";

interface StatCardProps {
  title: string;
  amount: number;
  icon: React.ElementType;
  trend?: number;
  color: string;
}

export function StatCard({
  title,
  amount,
  icon: Icon,
  trend,
  color,
}: StatCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow duration-200 bg-card/50 backdrop-blur-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={cn("p-2 rounded-lg", color)}>
            <Icon className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="mt-4">
          <h2 className="text-3xl font-bold tracking-tight">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(amount)}
          </h2>
          {trend && (
            <p
              className={cn(
                "text-xs mt-1 flex items-center gap-1",
                trend > 0 ? "text-emerald-500" : "text-rose-500",
              )}
            >
              {trend > 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(trend)}% em relação ao mês anterior
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
