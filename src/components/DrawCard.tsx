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
        "cursor-pointer transition-all duration-300 hover:shadow-glow hover:scale-[1.03] bg-gradient-card border-border/50 group",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">
              {draw.name}
            </h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{draw.time}</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all">
            <span className="text-white font-bold text-xl">5</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
