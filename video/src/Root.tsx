import { Composition } from "remotion";
import { Video, FPS } from "./Video";

// 38.35s audio → 1151 frames at 30fps; round up to 1170 for a tiny outro tail
const DURATION = 1170;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="distract-blocker"
      component={Video}
      durationInFrames={DURATION}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
