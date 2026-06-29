import { FC, SVGProps } from "react";

import { cn } from "@/shared/lib/utils";

import { getInitial } from "../model/lib";

const SparkleIcon: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.5l1.9 5.7 5.6 1.8-5.6 1.9L12 17.5l-1.9-5.6-5.6-1.9 5.6-1.8L12 2.5z" />
    <path
      d="M18.5 14l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6z"
      opacity="0.65"
    />
  </svg>
);

type Props = {
  name: string;
  isAi?: boolean;
  size?: number;
  className?: string;
};

export const ChatAvatar: FC<Props> = ({
  name,
  isAi = false,
  size = 48,
  className,
}) => {
  const dimensions = { width: size, height: size };

  if (isAi) {
    return (
      <div
        style={dimensions}
        className={cn(
          "shrink-0 rounded-full flex items-center justify-center text-white bg-linear-to-br from-primary to-[#FF8A6B]",
          className,
        )}
      >
        <SparkleIcon style={{ width: size * 0.5, height: size * 0.5 }} />
      </div>
    );
  }

  return (
    <div
      style={dimensions}
      className={cn(
        "shrink-0 rounded-full flex items-center justify-center bg-primary-tint text-primary font-semibold",
        className,
      )}
    >
      {getInitial(name)}
    </div>
  );
};
