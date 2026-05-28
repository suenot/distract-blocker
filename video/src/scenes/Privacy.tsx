import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Mascot } from "../components/Mascot";

const FONT = "Inter, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";

interface Props {
  points: string[];
}

export const Privacy: React.FC<Props> = ({ points }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(f, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(
    f,
    [durationInFrames - 14, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at 50% 50%, #1e1418 0%, #0d0e11 70%)",
        fontFamily: FONT,
        opacity,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 80,
      }}
    >
      <Mascot size={320} state="on" />

      <div>
        {points.map((p, i) => {
          const start = 10 + i * 18;
          const o = interpolate(f, [start, start + 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const y = interpolate(f, [start, start + 18], [16, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={p}
              style={{
                opacity: o,
                transform: `translateY(${y}px)`,
                color: "#e9eaec",
                fontSize: 56,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 24,
              }}
            >
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  background: "#e63946",
                  display: "inline-block",
                }}
              />
              {p}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
