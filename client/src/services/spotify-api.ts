import { refreshAccessToken } from '~/lib/spotify-auth';
import { ApiAccessToken, Artist, CurrentlyPlayingTrack, PlaybackState, RecentlyPlayed, UserProfile, UserQueue } from './types/spotify-api.interface';
// polyfills locks, in case is non-secure connection (http)
import "navigator.locks";

const API_ENDPOINT = "https://api.spotify.com/v1";

interface SpotifyApiConstructor {
  accessToken: string;
  refreshToken: string;
}

type TimedResponse = Response & {
  latency: number;
}

class SpotifyApi {
  private _accessToken: string;
  private _refreshToken: string;

  public get accessToken() {
    // request lock on readonly mode
    return navigator.locks.request('refreshToken', { mode: 'shared' },
      () => this._accessToken
    ) as Promise<typeof this._accessToken>;
  }

  constructor({ accessToken, refreshToken }: SpotifyApiConstructor) {
    this._accessToken = accessToken;
    this._refreshToken = refreshToken;
  }

  private async amoticRefreshToken() {
    const refreshedToken = await navigator.locks.request('refreshToken', { ifAvailable: true },
      async (lock) => {
        // if someone is already refreshing the token
        if (!lock) return null;

        const result = await refreshAccessToken(this._refreshToken);
        this._accessToken = result.access_token;
        this._refreshToken = result.refresh_token;

        return result
      }
    ) as ApiAccessToken | null;

    const wasSomeOneAlreadyRefreshingToken = refreshedToken === null;
    // waits for lock to be released
    if (wasSomeOneAlreadyRefreshingToken) await navigator.locks.request('refreshToken', { mode: 'shared' }, () => { })
  }

  private async fetcher(...args: Parameters<typeof fetch>) {
    const start = Date.now();
    let response = await fetch(...args) as TimedResponse;
    const latency = Date.now() - start;
    response.latency = latency

    switch (response.status) {
      case 401: {
        console.warn("Bad or expired token. Attempting to refesh token");
        await this.amoticRefreshToken();
        // @ts-ignore
        args[1].headers['Authorization'] = `Bearer ${this._accessToken}`
        const start = Date.now();
        response = await fetch(...args) as TimedResponse;
        const latency = Date.now() - start;
        response.latency = latency

        if (response.status === 401) throw new Error("Failed to refresh token");
        break;
      }
      case 403: throw new Error("Bad OAuth request");
      case 429: throw new Error("The app has exceeded its rate limits");
      case 500: throw new Error("Internal Server Error");
      case 503: throw new Error("Service Unavailable, try again in a few minutes");
    }

    return response;
  }

  async getArtist(id: string) {
    const response = await this.fetcher(`${API_ENDPOINT}/artists/${id}`, {
      headers: { Authorization: `Bearer ${await this.accessToken}` }
    });
    return await response.json() as Artist;
  }

  async getMyProfile() {
    const response = await this.fetcher(`${API_ENDPOINT}/me`, {
      headers: { Authorization: `Bearer ${await this.accessToken}` }
    });

    return await response.json() as UserProfile;
  }

  async getPlaybackState() {
    const response = await this.fetcher(`${API_ENDPOINT}/me/player`, {
      headers: { Authorization: `Bearer ${await this.accessToken}` }
    });

    if (response.status === 204) {
      console.warn('Playback fetch failed: Playback not available or active')
      return { data: null, fetchLatency: response.latency };
    }
    return {
      data: await response.json() as PlaybackState,
      fetchLatency: response.latency
    }
  }

  async getCurrentPlaying() {
    const response = await this.fetcher(`${API_ENDPOINT}/me/player/currently-playing`, {
      headers: { Authorization: `Bearer ${await this.accessToken}` }
    });

    if (response.status === 204) {
      console.warn('CurrentPlaying fetch failed: Playback not available or active')
      return { data: null, fetchLatency: response.latency };
    }

    return {
      data: await response.json() as CurrentlyPlayingTrack,
      fetchLatency: response.latency
    }
  }

  async getRecentlyPlayed() {
    const response = await this.fetcher(`${API_ENDPOINT}/me/player/recently-played`, {
      headers: { Authorization: `Bearer ${await this.accessToken}` },

    });

    return await response.json() as RecentlyPlayed;
  }

  async getUserQueue() {
    const response = await this.fetcher(`${API_ENDPOINT}/me/player/queue`, {
      headers: { Authorization: `Bearer ${await this.accessToken}` }
    });

    return await response.json() as UserQueue;
  }
}

export default SpotifyApi;
