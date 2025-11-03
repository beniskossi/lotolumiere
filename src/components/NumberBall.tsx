import { cn } from "@/lib/utils";
import { getNumberColorClasses } from "@/utils/numberColors";

interface NumberBallProps {
  number: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const NumberBall = ({ number, size = "md", className }: NumberBallProps) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold shadow-md border-2 transition-all duration-200 hover:scale-110 hover:shadow-lg",
        getNumberColorClasses(number),
        sizeClasses[size],
        className
      )}
    >
      {number}
    </div>
  );
};
