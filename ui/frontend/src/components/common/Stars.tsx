/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable unicorn/no-nested-ternary */
import { Star } from "lucide-react";
import { FC, useEffect } from "react";

import { cn } from "@/lib/utils";

const OneStar: FC<{ percentage: number; size: string }> = ({
  percentage,
  size,
}) => {
  return (
    <div
      className={cn(
        "relative bg-secondary overflow-hidden text-white flex items-center justify-center p-0",
        size == "md" && "h-10 w-10 rounded-xl",
        size == "sm" && "h-8 w-8 rounded",
      )}
    >
      <div
        className="absolute inset-0 h-full bg-primary"
        style={{
          width: `${percentage}%`,
        }}
      />

      <Star
        className={cn(
          "z-10",
          size == "md" && "h-5 w-5",
          size == "sm" && "h-3 w-3",
        )}
      />
    </div>
  );
};

export const StarClick: FC<{
  onClick: (score: number) => void;
  value: number;
}> = ({ onClick, value }) => {
  useEffect(() => {
    console.log(value);
  }, [value]);

  return (
    <>
      {...Array.from({ length: 5 })
        .fill(0)
        .map((_, index, __, v = (index + 1) * 20) => (
          <button
            key={index}
            onClick={() => onClick(v)}
            className={"px-2 outline-none"}
          >
            <OneStar
              percentage={
                v >= value + 20
                  ? 0
                  : value >= v
                    ? 100
                    : ((20 - (v - value)) / 20) * 100
              }
              size="md"
            />
          </button>
        ))}
    </>
  );
};

export const Stars: FC<{ percent: number; size?: "sm" | "md" }> = ({
  percent,
  size = "md",
}) => {
  // Calculate percentage for each star
  const fullStars = Math.floor(percent / 20);
  const partialStarPercentage = (percent % 20) * 5; // Each star represents 20%, so we multiply the remainder by 5

  const starPercentages = Array.from({ length: 5 })
    .fill(0)
    .map((_, index) => {
      if (index < fullStars) {
        return 100;
      } else if (index === fullStars) {
        return partialStarPercentage;
      } else {
        return 0;
      }
    });

  return (
    <div className="flex gap-2">
      {starPercentages.map((percentage, index) => (
        <OneStar key={index} percentage={percentage} size={size} />
      ))}
    </div>
  );
};
