#!/usr/bin/env bash
# Generate voiceover from script.txt
# Default: macOS 'say' (free, local). Replace with Deepgram/etc when key is available.
set -euo pipefail
cd "$(dirname "$0")"

VOICE="${VOICE:-Daniel}"    # British male, clear
RATE="${RATE:-175}"          # words per minute
OUT_AIFF="public/voiceover.aiff"
OUT_WAV="public/voiceover.wav"

mkdir -p public

# Strip [section] markers and blank lines, leave just the prose
script_text=$(grep -v '^\[' script.txt | grep -v '^$' | tr '\n' ' ')

echo "Voice: $VOICE  Rate: ${RATE}wpm"
echo "Generating $OUT_AIFF..."
say -v "$VOICE" -r "$RATE" -o "$OUT_AIFF" "$script_text"

echo "Converting to $OUT_WAV..."
afconvert "$OUT_AIFF" -d LEI16@44100 -f WAVE "$OUT_WAV"

# Report duration
dur=$(afinfo "$OUT_WAV" | awk '/estimated duration/ {print $3}')
echo "Duration: ${dur}s"
echo "Done."
