#!/usr/bin/env python3
"""
Generate voiceover via OpenRouter -> openai/gpt-audio-mini.
Streams audio chunks, concatenates base64 PCM/WAV, writes voiceover.wav.
"""
import os, sys, json, base64, re, wave
from urllib.request import Request, urlopen

API_KEY = os.environ.get("OPENROUTER_API_KEY")
if not API_KEY:
    sys.exit("OPENROUTER_API_KEY not set")

MODEL = os.environ.get("TTS_MODEL", "openai/gpt-audio-mini")
VOICE = os.environ.get("TTS_VOICE", "ash")  # alloy, ash, ballad, coral, echo, sage, shimmer, verse
SCRIPT_PATH = os.path.join(os.path.dirname(__file__), "script.txt")
OUT_PATH = os.path.join(os.path.dirname(__file__), "public", "voiceover.wav")

os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

with open(SCRIPT_PATH) as f:
    script_text = " ".join(
        line.strip() for line in f
        if line.strip() and not line.strip().startswith("[")
    )

# Ask the model to say the script verbatim. Use developer/system to keep it tight.
body = {
    "model": MODEL,
    "stream": True,
    "modalities": ["text", "audio"],
    "audio": {"voice": VOICE, "format": "pcm16"},
    "messages": [
        {
            "role": "system",
            "content": (
                "You are a voiceover narrator. Read the user's text verbatim "
                "in a warm, clear, slightly playful but professional tone. "
                "Do not add any words of your own. Do not say 'sure' or "
                "'here you go'. Do not explain. Just read the text."
            ),
        },
        {"role": "user", "content": script_text},
    ],
}

req = Request(
    "https://openrouter.ai/api/v1/chat/completions",
    data=json.dumps(body).encode(),
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
    },
    method="POST",
)

pcm_bytes = bytearray()
transcript = []

with urlopen(req) as resp:
    for raw in resp:
        line = raw.decode("utf-8", "ignore").rstrip("\n")
        if not line.startswith("data: "):
            continue
        payload = line[len("data: "):].strip()
        if payload == "[DONE]":
            break
        try:
            chunk = json.loads(payload)
        except json.JSONDecodeError:
            continue
        for choice in chunk.get("choices", []):
            delta = choice.get("delta") or {}
            audio = delta.get("audio") or {}
            data_b64 = audio.get("data")
            if data_b64:
                # missing padding tolerance
                pad = "=" * (-len(data_b64) % 4)
                pcm_bytes.extend(base64.b64decode(data_b64 + pad))
            t = audio.get("transcript")
            if t:
                transcript.append(t)

print(f"Got {len(pcm_bytes)} PCM bytes")
if not pcm_bytes:
    sys.exit("no audio data received")

# pcm16 from OpenAI is 24kHz mono signed 16-bit
with wave.open(OUT_PATH, "wb") as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(24000)
    wf.writeframes(bytes(pcm_bytes))

dur = len(pcm_bytes) / 2 / 24000
print(f"Wrote {OUT_PATH} ({dur:.2f}s, voice={VOICE})")
if transcript:
    print("Transcript:", "".join(transcript)[:300], "...")
