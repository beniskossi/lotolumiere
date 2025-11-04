import { cn } from "@/lib/utils";
import { getNumberColorClasses } from "@/utils/numberColors";

interface NumberBallProps {
  number: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const NumberBall = ({ number, size = "md", className }: NumberBallProps) => {
  const sizeClasses = {
    sm: "w-7 h-7 sm:w-8 sm:h-8 text-xs",
    md: "w-9 h-9 sm:w-10 sm:h-10 text-sm",
    lg: "w-12 h-12 sm:w-14 sm:h-14 text-base sm:text-lg",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold shadow-md border-2 transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-lg touch-target",
        getNumberColorClasses(number),
        sizeClasses[size],
        className
      )}
    >
      {number}
    </div>
  );
};
