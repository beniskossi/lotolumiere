import { DrawCard } from "./DrawCard";
import { DrawSchedule } from "@/types/lottery";
import { useNavigate } from "react-router-dom";

interface DaySectionProps {
  day: string;
  draws: DrawSchedule[];
}

export const DaySection = ({ day, draws }: DaySectionProps) => {
  const navigate = useNavigate();

  const handleDrawClick = (draw: DrawSchedule) => {
    navigate(`/tirage/${encodeURIComponent(draw.name)}`);
  };

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground bg-gradient-primary bg-clip-text text-transparent">
          {day}
        </h2>
        <div className="h-1 w-16 bg-gradient-accent rounded-full mt-2"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {draws.map((draw) => (
          <DrawCard key={draw.name} draw={draw} onClick={() => handleDrawClick(draw)} />
        ))}
      </div>
    </div>
  );
};
