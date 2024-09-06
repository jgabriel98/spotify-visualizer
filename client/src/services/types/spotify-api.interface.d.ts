import { Country } from "./helpers-types";
import './spotify-api.objects'

declare interface AuthenticationErrorObject {
  /** A high level description of the error as specified in [RFC 6749 Section 5.2](https://tools.ietf.org/html/rfc6749#section-5.2). */
  error: string;
  /** A more detailed description of the error as specified in [RFC 6749 Section 4.1.2.1](https://tools.ietf.org/html/rfc6749#section-4.1.2.1). */
  error_description: string;
}

declare interface RegularErrorObject {
  /** The HTTP status code that is also returned in the response header. For further information, see [Response Status Codes](https://developer.spotify.com/documentation/web-api/concepts/api-calls#response-status-codes). */
  status: number;
  /** A short description of the cause of the error. */
  message: string;
}

declare interface ApiAccessToken {
  /** An access token that can be provided in subsequent calls, for example to Spotify Web API services. */
  access_token: string;
  /** How the access token may be used: always "Bearer". */
  token_type: string;
  /** The time period (in seconds) for which the access token is valid. */
  expires_in: number;
  /** A space-separated list of scopes which have been granted for this access_token */
  scope: string;
  /** See [refreshing tokens](https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens). */
  refresh_token: string;
}

declare interface UserProfile {
  /** The markets in which the user is available: [ISO 3166-1 alpha-2](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country codes */
  country: (keyof typeof Country)[];
  /** The name displayed on the user's profile. null if not available. */
  display_name: string | null;
  email: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  },
  external_urls: { spotify: string; };
  followers: { href: string; total: number; };
  /** A link to the Web API endpoint for this user. */
  href: string;
  /** The [Spotify user ID](https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids) for the user. */
  id: string;
  /** The user's profile image. */
  images: ImageObject[];
  /** The user's Spotify subscription level */
  product?: "premium" | "free" | "open";
  type: string;
  /** The Spotify URI for the user. */
  uri: string;
}

declare interface Artist extends ArtistObject { };

type _PossibleActions = {
  interrupting_playback?: boolean;
  pausing?: boolean;
  resuming?: boolean;
  seeking?: boolean;
  skipping_next?: boolean;
  skipping_prev?: boolean;
  toggling_repeat_context?: boolean;
  toggling_shuffle?: boolean;
  toggling_repeat_track?: boolean;
  transferring_playback?: boolean;
};

declare interface PlaybackState {
  /** The device that is currently active. */
  device: Device;
  repeat_state: "off" | "track" | "context";
  /** If shuffle is on or off. */
  shuffle_state: boolean;
  /** A Context Object. Can be null. */
  context: ContextObject | null;
  /** Unix Millisecond Timestamp when playback state was last changed (play, pause, skip, scrub, new song, etc.). */
  timestamp: number;
  /** Progress into the currently playing track or episode. Can be null. */
  progress_ms: number;
  is_playing: boolean;
  item: TrackObject;
  /** The object type of the currently playing item. Can be one of track, episode, ad or unknown. */
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown';
  /** Allows to update the user interface based on which playback actions are available within the current context. */
  actions: {
    disallows: _PossibleActions;
    allows?: _PossibleActions;
  }
}

declare interface CurrentlyPlayingTrack {
  /** A Context Object. Can be null. */
  context: ContextObject | null;
  /** Unix Millisecond Timestamp when playback state was last changed (play, pause, skip, scrub, new song, etc.). */
  timestamp: number;
  /** Progress into the currently playing track or episode. Can be null. */
  progress_ms: number;
  is_playing: boolean;
  item: TrackObject;
  /** The object type of the currently playing item. Can be one of track, episode, ad or unknown. */
  currently_playing_type: 'track' | 'episode' | 'ad' | 'unknown';
  /** Allows to update the user interface based on which playback actions are available within the current context. */
  actions: {
    disallows: _PossibleActions;
    allows?: _PossibleActions;
  }
}

declare interface UserQueue {
  /** The currently playing track or episode. Can be null. */
  currently_playing: TrackObject | null;
  /** The tracks or episodes in the queue. Can be empty. */
  queue: TrackObject[];
}

interface _RecentlyPlayedRequestBase {
  /** The maximum number of items to return. Default: 20. Minimum: 1. Maximum: 50. */
  limit: NumericRange<0, 50>;
  /** A Unix timestamp in milliseconds. Returns all items after (but not including) this cursor position. If after is specified, before must not be specified. */
  after?: number;
  /** A Unix timestamp in milliseconds. Returns all items before (but not including) this cursor position. If before is specified, after must not be specified. */
  before?: number;
}

interface _RecentlyPlayedRequest_option1 {
  /** The maximum number of items to return. Default: 20. Minimum: 1. Maximum: 50. */
  limit: NumericRange<0, 50>;
  /** A Unix timestamp in milliseconds. Returns all items after (but not including) this cursor position. If after is specified, before must not be specified. */
  after?: number;
  /** A Unix timestamp in milliseconds. Returns all items before (but not including) this cursor position. If before is specified, after must not be specified. */
  before?: never;
}

interface _RecentlyPlayedRequest_option2 {
  /** The maximum number of items to return. Default: 20. Minimum: 1. Maximum: 50. */
  limit: NumericRange<0, 50>;
  /** A Unix timestamp in milliseconds. Returns all items after (but not including) this cursor position. If after is specified, before must not be specified. */
  after?: never;
  /** A Unix timestamp in milliseconds. Returns all items before (but not including) this cursor position. If before is specified, after must not be specified. */
  before?: number;
}

declare type RecentlyPlayedApiRequest = _RecentlyPlayedRequest_option1 | _RecentlyPlayedRequest_option2


declare interface RecentlyPlayed {
  /** A link to the Web API endpoint returning the full result of the request. */
  href: string;
  /** The maximum number of items in the response (as set in the query or by default). */
  limit: NumericRange<0, 50>;
  /** URL to the next page of items. ( null if none) */
  next: string | null;
  /** The cursors used to find the next set of items. */
  cursors: {
    after: string;
    before: string;
  };
  /** The total number of items available to return. */
  total: number;
  /** array of PlayHistoryObject. */
  items: PlayHistoryObject;
}