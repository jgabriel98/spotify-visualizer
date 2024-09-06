import { ApiAccessToken } from "../../services/types/spotify-api.interface";
import { getUrlSearchParams } from "../../utils/fetch";
import { getLocalStorage, setLocalStorage } from "../../utils/localSorage";
import { appPermissionScopes } from "./contants";
import { fetchAuthToken, fetchRefreshToken, redirectToRequestUserAuthorization } from "./service-api";

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;

export async function handleNewSpotifyAuthorizationCode(_code?: string) {
  const code = _code ?? getUrlSearchParams(['code']).code;
  if (!code) throw new Error("'code' not found on URL Search params");

  const token = await fetchAuthToken(CLIENT_ID, code);
  setLocalStorage('spotify_authorization_token', token);

  return token
}

function hasRequiredPermissions(storedToken?: ApiAccessToken) {
  if (!storedToken) return false;

  let missingPermissions: string[] = [];
  if (storedToken.scope) missingPermissions = appPermissionScopes.filter(scope =>
    !storedToken.scope!.includes(scope)
  );
  if (missingPermissions.length > 0) return false;

  return true;
}

export function getStoredAuthToken() {
  const accessToken = getLocalStorage<ApiAccessToken>('spotify_authorization_token');

  // check if should get authorization again
  const isTokenInvalid = !accessToken || !hasRequiredPermissions(accessToken);
  if (isTokenInvalid) return undefined;

  console.debug('token retrieved from localstorage', accessToken)

  return accessToken;
}

export async function initAuthToken(): Promise<ApiAccessToken> {
  // if there's this SearchParams, then it's coming back the spotify authorization website
  const { code } = getUrlSearchParams(['code']);
  const accessToken = code ?
    await handleNewSpotifyAuthorizationCode(code) :
    getLocalStorage<ApiAccessToken>('spotify_authorization_token');

  // check if should get authorization again
  const isTokenInvalid = !accessToken || !hasRequiredPermissions(accessToken);
  if (isTokenInvalid) return await redirectToRequestUserAuthorization();

  console.debug('token retrieved from localstorage', accessToken)

  return accessToken!;
}

export async function refreshAccessToken(refreshToken: string) {
  const newAccessToken = await fetchRefreshToken(refreshToken);
  setLocalStorage('spotify_authorization_token', newAccessToken);
  return newAccessToken;
}