import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DrawSchedule } from "@/types/lottery";

interface DrawCardProps {
  draw: DrawSchedule;
  onClick: () => void;
  className?: string;
}

export const DrawCard = ({ draw, onClick, className }: DrawCardProps) => {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-gradient-card border-border/50",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground text-lg">{draw.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{draw.time}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-lg">5</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
