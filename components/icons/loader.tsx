import { HTMLAttributes } from "react";

interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
  size?:
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "8xl"
    | "9xl";
  color?: string;
  duration?: number;
}

export default function Loader({
  className,
  size = "md",
  color = "black",
  duration = 2500,
}: LoaderProps) {
  // Convert Tailwind size to pixel values
  const sizeMap = {
    xs: 16,
    sm: 20,
    md: 40,
    lg: 48,
    xl: 56,
    "2xl": 64,
    "3xl": 72,
    "4xl": 80,
    "5xl": 96,
    "6xl": 112,
    "7xl": 128,
    "8xl": 144,
    "9xl": 160,
  };

  const pixelSize = sizeMap[size];
  const speed = `${duration}ms`;

  const containerStyle = {
    "--uib-size": `${pixelSize}px`,
    "--uib-color": color,
    "--uib-speed": speed,
    "--uib-dot-size": `${pixelSize * 0.18}px`,
    position: "relative" as const,
    top: "15%",
    left: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };

  const dotStyle = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    height: "100%",
  };

  const dotBeforeStyle = {
    content: '""',
    display: "block",
    height: `${pixelSize * 0.22}px`,
    width: `${pixelSize * 0.22}px`,
    borderRadius: "50%",
    backgroundColor: color,
    transition: "background-color 0.3s ease",
  };

  const dot1Style = {
    ...dotStyle,
    animation: `leapFrog ${speed} ease infinite`,
  };

  const dot2Style = {
    ...dotStyle,
    transform: `translateX(${pixelSize * 0.4}px)`,
    animation: `leapFrog ${speed} ease calc(${speed} / -1.5) infinite`,
  };

  const dot3Style = {
    ...dotStyle,
    transform: `translateX(${pixelSize * 0.8}px) rotate(0deg)`,
    animation: `leapFrog ${speed} ease calc(${speed} / -3) infinite`,
  };

  return (
    <>
      <div style={containerStyle} className={className}>
        <div style={dot1Style}>
          <div style={dotBeforeStyle}></div>
        </div>
        <div style={dot2Style}>
          <div style={dotBeforeStyle}></div>
        </div>
        <div style={dot3Style}>
          <div style={dotBeforeStyle}></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes leapFrog {
          0% {
            transform: translateX(0) rotate(0deg);
          }

          33.333% {
            transform: translateX(0) rotate(180deg);
          }

          66.666% {
            transform: translateX(calc(var(--uib-size) * -0.38)) rotate(180deg);
          }

          99.999% {
            transform: translateX(calc(var(--uib-size) * -0.78)) rotate(180deg);
          }

          100% {
            transform: translateX(0) rotate(0deg);
          }
        }
      `}</style>
    </>
  );
}
