import React from "react";

interface BzmtLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "badge" | "horizontal" | "monogram";
  showSubtitle?: boolean;
}

export const BzmtLogo: React.FC<BzmtLogoProps> = ({
  className = "",
  size = "md",
  variant = "horizontal",
  showSubtitle = true,
}) => {
  const sizeClasses = {
    sm: {
      emblem: "w-7 h-7 text-xs rounded-lg",
      text: "text-xs",
      sub: "text-[9px]",
      gap: "gap-2",
    },
    md: {
      emblem: "w-9 h-9 text-sm rounded-xl",
      text: "text-sm",
      sub: "text-[10px]",
      gap: "gap-2.5",
    },
    lg: {
      emblem: "w-11 h-11 text-base rounded-xl",
      text: "text-base",
      sub: "text-xs",
      gap: "gap-3",
    },
    xl: {
      emblem: "w-14 h-14 text-xl rounded-2xl",
      text: "text-xl",
      sub: "text-xs",
      gap: "gap-3.5",
    },
  }[size];

  // Official Monogram Emblem for BZMT (Bin Ziyad & MeDo Tech)
  const Emblem = (
    <div
      className={`relative flex items-center justify-center font-black tracking-tighter bg-gradient-to-br from-[#0B192C] via-[#1E3A8A] to-[#0A2540] border border-amber-400/40 shadow-lg shadow-blue-950/60 select-none overflow-hidden shrink-0 ${sizeClasses.emblem}`}
      style={{
        fontFamily: "'Cinzel', 'Playfair Display', 'Times New Roman', serif",
      }}
    >
      {/* Subtle geometric luxury grid overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-blue-400/15 pointer-events-none" />
      <span className="relative z-10 bg-gradient-to-r from-amber-200 via-white to-amber-300 bg-clip-text text-transparent drop-shadow-sm font-black">
        BZMT
      </span>
      {/* Corner micro accent */}
      <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-amber-400/60 rounded-bl-sm" />
    </div>
  );

  if (variant === "monogram") {
    return Emblem;
  }

  return (
    <div className={`flex items-center ${sizeClasses.gap} ${className}`}>
      {Emblem}
      <div className="flex flex-col text-right justify-center">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black text-white tracking-wider font-mono ${sizeClasses.text}`}
          >
            BZMT
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 font-bold border border-amber-400/30">
            OFFICIAL
          </span>
        </div>
        {showSubtitle && (
          <span
            className={`text-slate-400 font-medium tracking-tight whitespace-nowrap ${sizeClasses.sub}`}
          >
            Bin Ziyad Group & MeDo Tech
          </span>
        )}
      </div>
    </div>
  );
};
