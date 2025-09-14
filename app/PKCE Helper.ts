import * as Crypto from "expo-crypto";
import * as Random from "expo-random";

export interface PKCEPair {
  verifier: string;
  challenge: string;
}

function toBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64ToBase64Url(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function generatePKCE(): Promise<PKCEPair> {
  const randomBytes = await Random.getRandomBytesAsync(32);
  const verifier = toBase64Url(randomBytes);

  const challengeBase64 = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );

  const challenge = base64ToBase64Url(challengeBase64);

  return { verifier, challenge };
}
