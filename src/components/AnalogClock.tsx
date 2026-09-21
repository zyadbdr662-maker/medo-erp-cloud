import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface AnalogClockProps {
  size?: number;
  showSeconds?: boolean;
  className?: string;
  showTooltip?: boolean;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({
  size = 36,
  showSeconds = true,
  className = "",
  showTooltip = true,
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Calculate angles (in degrees)
  // Hours: 30 deg per hour + 0.5 deg per min
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;
  // Minutes: 6 deg per minute + 0.1 deg per second
  const minuteAngle = minutes * 6 + seconds * 0.1;
  // Seconds: 6 deg per second
  const secondAngle = seconds * 6;

  // Formatted digital time string for tooltip and screen readers
  const timeFormatted = time.toLocaleTimeString("ar-YE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const radius = size / 2;
  const center = radius;

  // Scaled dimensions
  const hourHandLength = radius * 0.52;
  const minuteHandLength = radius * 0.72;
  const secondHandLength = radius * 0.82;

  return (
    <div
      id="enterprise-analog-clock-container"
      className={`relative inline-flex items-center justify-center select-none group cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`الوقت المعتمد في المنظومة: ${timeFormatted}`}
      aria-label={`الساعة التناظرية: ${timeFormatted}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
      >
        <defs>
          {/* Subtle metallic dial background gradient */}
          <radialGradient id="clockDialGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0B1E36" />
            <stop offset="70%" stopColor="#061220" />
            <stop offset="100%" stopColor="#020813" />
          </radialGradient>

          {/* Golden rim border gradient */}
          <linearGradient id="goldRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Blue glow effect */}
          <radialGradient id="centerPinGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </radialGradient>
        </defs>

        {/* Outer Golden Bezel */}
        <circle
          cx={center}
          cy={center}
          r={radius - 1}
          fill="url(#clockDialGrad)"
          stroke="url(#goldRimGrad)"
          strokeWidth="1.5"
        />

        {/* Inner subtle glow rim */}
        <circle
          cx={center}
          cy={center}
          r={radius - 2.5}
          fill="none"
          stroke="#1E3A8A"
          strokeWidth="0.75"
          strokeOpacity="0.8"
        />

        {/* Hour markers (12 tick marks) */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
          const isMajor = deg % 90 === 0;
          const rad = (deg * Math.PI) / 180;
          const rInner = radius - (isMajor ? 4.5 : 3);
          const rOuter = radius - 1.8;
          const x1 = center + rInner * Math.cos(rad);
          const y1 = center + rInner * Math.sin(rad);
          const x2 = center + rOuter * Math.cos(rad);
          const y2 = center + rOuter * Math.sin(rad);

          return (
            <line
              key={deg}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isMajor ? "#F59E0B" : "rgba(226, 232, 240, 0.4)"}
              strokeWidth={isMajor ? 1.5 : 0.8}
              strokeLinecap="round"
            />
          );
        })}

        {/* Hour Hand */}
        <line
          x1={center}
          y1={center}
          x2={center + hourHandLength * Math.cos((hourAngle * Math.PI) / 180)}
          y2={center + hourHandLength * Math.sin((hourAngle * Math.PI) / 180)}
          stroke="#FFFFFF"
          strokeWidth={size >= 40 ? 2.4 : 1.8}
          strokeLinecap="round"
        />

        {/* Minute Hand */}
        <line
          x1={center}
          y1={center}
          x2={center + minuteHandLength * Math.cos((minuteAngle * Math.PI) / 180)}
          y2={center + minuteHandLength * Math.sin((minuteAngle * Math.PI) / 180)}
          stroke="#D4AF37"
          strokeWidth={size >= 40 ? 1.8 : 1.4}
          strokeLinecap="round"
        />

        {/* Second Hand */}
        {showSeconds && (
          <>
            <line
              x1={center - 3.5 * Math.cos((secondAngle * Math.PI) / 180)}
              y1={center - 3.5 * Math.sin((secondAngle * Math.PI) / 180)}
              x2={center + secondHandLength * Math.cos((secondAngle * Math.PI) / 180)}
              y2={center + secondHandLength * Math.sin((secondAngle * Math.PI) / 180)}
              stroke="#EF4444"
              strokeWidth="0.9"
              strokeLinecap="round"
            />
            {/* Counterweight tail dot */}
            <circle
              cx={center - 3.5 * Math.cos((secondAngle * Math.PI) / 180)}
              cy={center - 3.5 * Math.sin((secondAngle * Math.PI) / 180)}
              r="0.8"
              fill="#EF4444"
            />
          </>
        )}

        {/* Center Pivot Pin */}
        <circle cx={center} cy={center} r="2" fill="url(#goldRimGrad)" />
        <circle cx={center} cy={center} r="1" fill="#EF4444" />
      </svg>

      {/* Floating Detailed Time Popover on Hover */}
      {showTooltip && isHovered && (
        <div className="absolute top-full mt-2 z-50 px-3 py-1.5 rounded-xl bg-slate-950/95 border border-[#D4AF37]/50 shadow-2xl text-center whitespace-nowrap backdrop-blur-md animate-in fade-in zoom-in-95 pointer-events-none">
          <div className="flex items-center gap-1.5 justify-center text-amber-300 font-mono text-xs font-black">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span dir="ltr">{timeFormatted}</span>
          </div>
          <div className="text-[10px] text-slate-300 font-sans mt-0.5">
            ساعة النظام الحية المعتمدة
          </div>
        </div>
      )}
    </div>
  );
};
