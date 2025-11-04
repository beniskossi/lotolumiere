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
        "cursor-pointer transition-all duration-300 hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] bg-gradient-card border-border/50 group touch-target",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-base sm:text-lg mb-1 group-hover:text-primary transition-colors truncate">
              {draw.name}
            </h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium">{draw.time}</span>
            </div>
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all flex-shrink-0">
            <span className="text-white font-bold text-lg sm:text-xl">5</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
