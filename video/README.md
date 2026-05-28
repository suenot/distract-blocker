# Promo video (Remotion + OpenRouter TTS)

A ~39-second promo video for YouTube and the Chrome Web Store promo-video slot.

## Pipeline

1. **Voiceover** — generated via OpenRouter → `openai/gpt-audio-mini` (chat completions with `stream:true`, `modalities:["text","audio"]`, voice `ash`). Writes 24kHz mono `voiceover.wav`.
2. **Composition** — 6 scenes in Remotion, 1920×1080 @ 30fps:
   - Hook (0-4s) — mascot + animated three-line headline
   - Overview (4-15s) — `screenshots/01-overview` with Ken Burns + caption
   - Schedule (15-23s) — `screenshots/02-schedule`
   - Languages (23-29s) — `screenshots/04-languages`
   - Privacy (29-35s) — mascot + 5 staggered bullets
   - CTA (35-39s) — mascot + brand mark + Chrome Web Store button + URL
3. **Render** — H.264 + AAC, ~11 MB output.

## Run

```bash
# 1. Install deps (~500 MB)
npm install

# 2. Generate voiceover via OpenRouter
#    (requires OPENROUTER_API_KEY in env)
python3 gen-audio-openrouter.py

# 3. Preview in the Remotion Studio
npm run preview

# 4. Render the final mp4
npm run render
```

Output: `out/distract-blocker.mp4`.

## Swap audio for Deepgram later

When you add `DEEPGRAM_API_KEY` to `~/.zshrc`, replace `gen-audio-openrouter.py` with a curl call to `https://api.deepgram.com/v1/speak?model=aura-asteria-en` (or similar voice), re-run, then `npm run render`. Nothing in `src/` changes.

## Why OpenRouter, not Deepgram?

`.zshrc` had no `DEEPGRAM_API_KEY` at the time. OpenRouter exposed audio-output models (`openai/gpt-audio`, `openai/gpt-audio-mini`, `openai/gpt-4o-audio-preview`) via chat completions + streaming — that path worked with the existing `OPENROUTER_API_KEY`. (Per the AI Overview suggesting Gemini 3.1 Flash TTS / Grok Voice / Voxtral Mini — those model IDs aren't actually present in OpenRouter's `/api/v1/models` response; the dedicated `/v1/audio/speech` endpoint accepts the schema but has no providers wired in yet.)

## Tweaking

- **Script** — edit `script.txt`, re-run audio gen, adjust `Video.tsx` Sequence timings if word counts shift.
- **Voice** — set `TTS_VOICE=alloy|ash|ballad|coral|echo|sage|shimmer|verse` before running the audio script.
- **Scenes** — files in `src/scenes/` are independent; each gets its own `Sequence` in `src/Video.tsx`.
