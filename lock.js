// Protected-mode credential helpers (shared by the side panel).
//
// The user's PIN or password is NEVER stored. We keep only a salted
// PBKDF2-SHA256 hash in chrome.storage.local under the "lock" key:
//   { type: "pin" | "password", salt: <hex>, hash: <hex>, iterations }
//
// This is a local focus deterrent within one browser, not tamper-proof
// parental control — anyone able to clear the extension's storage or
// remove the extension can bypass it. There is no recovery path.

const LOCK_KEY = "lock";
const LOCK_ITERATIONS = 150000;

function bufToHex(buf) {
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

async function deriveHash(code, saltBytes, iterations) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(code), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations, hash: "SHA-256" },
    keyMaterial, 256
  );
  return bufToHex(bits);
}

async function createLock(type, code) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveHash(code, salt, LOCK_ITERATIONS);
  return { type, salt: bufToHex(salt), hash, iterations: LOCK_ITERATIONS };
}

async function verifyCode(lock, code) {
  if (!lock || !lock.hash || !lock.salt) return false;
  const hash = await deriveHash(code, hexToBytes(lock.salt), lock.iterations || LOCK_ITERATIONS);
  // Length-independent constant-time-ish comparison.
  if (hash.length !== lock.hash.length) return false;
  let diff = 0;
  for (let i = 0; i < hash.length; i++) diff |= hash.charCodeAt(i) ^ lock.hash.charCodeAt(i);
  return diff === 0;
}
