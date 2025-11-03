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
    <div className="mb-10 animate-fade-in">
      <div className="mb-6 relative">
        <h2 className="text-3xl font-bold text-foreground inline-block relative">
          {day}
          <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-accent rounded-full"></div>
        </h2>
        <p className="text-sm text-muted-foreground mt-3">
          {draws.length} tirages disponibles
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {draws.map((draw, idx) => (
          <div
            key={draw.name}
            style={{ animationDelay: `${idx * 50}ms` }}
            className="animate-fade-in"
          >
            <DrawCard draw={draw} onClick={() => handleDrawClick(draw)} />
          </div>
        ))}
      </div>
    </div>
  );
};
