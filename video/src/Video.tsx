import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Hook } from "./scenes/Hook";
import { Overview } from "./scenes/Overview";
import { Schedule } from "./scenes/Schedule";
import { Languages } from "./scenes/Languages";
import { Privacy } from "./scenes/Privacy";
import { CTA } from "./scenes/CTA";

export const FPS = 30;

// Section boundaries (frames) based on voiceover spectrogram:
// hook  0:00 - 0:04 ≈ 0-120
// over  0:04 - 0:15 ≈ 120-450
// sched 0:15 - 0:23 ≈ 450-690
// lang  0:23 - 0:29 ≈ 690-870
// priv  0:29 - 0:35 ≈ 870-1050
// cta   0:35 - 0:39 ≈ 1050-1170
export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0d0e11" }}>
      <Audio src={staticFile("voiceover.wav")} />

      <Sequence from={0} durationInFrames={120}>
        <Hook />
      </Sequence>
      <Sequence from={120} durationInFrames={330}>
        <Overview />
      </Sequence>
      <Sequence from={450} durationInFrames={240}>
        <Schedule />
      </Sequence>
      <Sequence from={690} durationInFrames={180}>
        <Languages />
      </Sequence>
      <Sequence from={870} durationInFrames={180}>
        <Privacy />
      </Sequence>
      <Sequence from={1050} durationInFrames={120}>
        <CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
