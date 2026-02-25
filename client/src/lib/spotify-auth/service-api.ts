import { ApiAccessToken, AuthenticationErrorObject } from "../../services/types/spotify-api.interface";
import { getLocalStorage, setLocalStorage } from "../../utils/localSorage";
import { appPermissionScopes } from "./contants";
import { generateRandomString, generateSecureCodeChallenge } from "./helpers";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

const AUTH_CALLBACK_URL = new URL(`${window.location.protocol}//${import.meta.env.VITE_SPOTIFY_AUTH_CALLBACK_HOST}`);
AUTH_CALLBACK_URL.port = import.meta.env.VITE_SERVER_PORT ?? '';
AUTH_CALLBACK_URL.pathname = '/auth';

/** runs on external device, after user scans QR code and authorizes app on spotify's website  */
export async function buildRequestUserAuthorizationURL(searchParams?: Record<string, string>) {
  const redirectUri = new URL(AUTH_CALLBACK_URL)
  if (searchParams) redirectUri.search = new URLSearchParams(searchParams).toString();

  const authEndpoint = new URL("https://accounts.spotify.com/authorize");

  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateSecureCodeChallenge(codeVerifier);
  const state = generateRandomString(8);

  setLocalStorage('code_verifier', codeVerifier);

  authEndpoint.search = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: appPermissionScopes.join(' '),
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: redirectUri.toString(), // http[s]://[hostname]
    state,
  }).toString();

  return authEndpoint;
}

/** Fetch user authorization */
export async function fetchAuthToken(clientId: string, code: string) {
  const codeVerifier = getLocalStorage<string>('code_verifier');

  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', AUTH_CALLBACK_URL.toString());
  params.append('code_verifier', codeVerifier!);

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params
  });

  const responseBody: ApiAccessToken & AuthenticationErrorObject = (await response.json());
  if (responseBody.error) throw new Error(`Error ${response.status}: ${responseBody.error_description}`)
  return responseBody as ApiAccessToken;
}

export async function fetchRefreshToken(refreshToken: ApiAccessToken['refresh_token']) {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID
    })
  });

  const responseBody: ApiAccessToken & AuthenticationErrorObject = (await response.json());
  if (responseBody.error) throw new Error(`Error ${response.status}: ${responseBody.error_description}`)
  return responseBody as ApiAccessToken;
}

/** fetches Application client credentials */
export async function fetchClientCredentials(clientId: string, clientSecret: string) {
  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('grant_type', 'client_credentials');
  params.append('client_secret', clientSecret);

  const result = await fetch("https://accounts.spotify.com/api/token", {
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params
  });

  return (await result.json()) as Omit<ApiAccessToken, 'scope' | 'refresh_token'>;
}