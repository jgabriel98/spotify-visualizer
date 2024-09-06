/* based on https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow */
import { sha256 as _sha256 } from 'js-sha256'

export function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = window.crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

async function sha256(plain: string) {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)

  if (window.crypto.subtle)
    return await window.crypto.subtle.digest('SHA-256', data);
  else
    return _sha256.create().update(data).arrayBuffer();
}

function base64encode(input: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export async function generateSecureCodeChallenge(codeVerifier: string) {
  const hashed = await sha256(codeVerifier)
  const codeChallenge = base64encode(hashed);
  return codeChallenge;
}
