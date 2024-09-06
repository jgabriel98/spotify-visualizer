declare type Device = {
  /** The device ID. This ID is unique and persistent to some extent. However, this is not guaranteed and any cached device_id should periodically be cleared out and refetched as necessary. */
  id: string | null;
  /** If this device is the currently active device. */
  is_active: boolean;
  /** If this device is currently in a private session. */
  is_private_session: boolean;
  /** Whether controlling this device is restricted. At present if this is "true" then no Web API commands will be accepted by this device. */
  is_restricted: boolean;
  name: boolean //"Kitchen speaker";
  /** Device type, such as "computer", "smartphone" or "speaker". */
  type: 'computer' | 'smarthphone' | 'speaker' | string;
  /** The current volume in percent [0-100]. */
  volume_percent: number | null;
  /** If this device can be used to set the volume. */
  supports_volume: boolean;
};

declare type ContextObject = {
  /** The object type, e.g. "artist", "playlist", "album", "show". */
  type: "artist" | "playlist" | "album" | "show" | "collection";
  /** A link to the Web API endpoint providing full details of the track. */
  href: string;
  /** External URLs for this context. */
  external_urls: {
    /** The [Spotify URL](https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids) for the object. */
    spotify: string;
  };
  /** The [Spotify URI](https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids) for the context. */
  uri: string;
};

declare type ImageObject = {
  /** The source URL of the image. */
  url: string;
  /** The image height in pixels. */
  height?: number;
  /** The image width in pixels. */
  width?: number;
};

declare type SimplifiedArtistObject = {
  /** Known external URLs for this artist. */
  external_urls: {
    spotify: string;
  };
  /** A link to the Web API endpoint providing full details of the artist. */
  href: string;
  /** The [Spotify ID](https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids) for the artist. */
  id: string;
  /** The name of the artist. */
  name: string;
  type: "artist";
  /** The [Spotify URI](https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids) for the artist. */
  uri: string;
};

declare type Album = {
  /** The type of the album. */
  album_type: "album" | "single" | "compilation";
  /** The number of tracks in the album. */
  total_tracks: number;
  /** The markets in which the album is available: [ISO 3166-1 alpha-2](http://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country codes. NOTE: an album is considered available in a market when at least 1 of its tracks is available in that market */
  available_markets: (keyof typeof Country)[];
  /** Known external URLs for this album. */
  external_urls: { spotify: string };
  /** A link to the Web API endpoint providing full details of the album. */
  href: string;
  /** The [Spotify ID](https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids) for the album. */
  id: "2up3OPMp9Tb4dAKM2erWXQ";
  /** The cover art for the album in various sizes, widest first */
  images: ImageObject[];
  /** The name of the album. In case of an album takedown, the value may be an empty string. */
  name: string;
  /** The date the album was first released. Example: "1981-12"*/
  release_date: string;
  /** The precision with which release_date value is known */
  release_date_precision: "year" | "month" | "day";
  /** Included in the response when a content restriction is applied. */
  restrictions: {
    /** The reason for the restriction. Albums may be restricted if the content is not available in a given market, to the user's subscription type, or when the user's account is set to not play explicit content. Additional reasons may be added in the future */
    reason: "market" | "product" | "explicit"
  };
  type: "album";
  /** The [Spotify URI](https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids) for the album. */
  uri: string;
  /** The artists of the album. Each artist object includes a link in href to more detailed information about the artist. */
  artists: SimplifiedArtistObject[];
};

declare type ArtistObject = {
  /** Known external URLs for this artist. */
  external_urls: { spotify: string };
  /** Information about the followers of the artist. */
  followers: {
    /** This will always be set to null, as the Web API does not support it at the moment. */
    href: null;
    /** The total number of followers. */
    total: number
  };
  /** A list of the genres the artist is associated with. If not yet classified, the array is empty. */
  genres: string[];
  /** A link to the Web API endpoint providing full details of the artist. */
  href: string;
  /** The [Spotify ID](https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids) for the artist. */
  id: string;
  /** Images of the artist in various sizes, widest first. */
  images: ImageObject[];
  /** The name of the artist. */
  name: string;
  /** The popularity of the artist. The value will be between 0 and 100, with 100 being the most popular. The artist's popularity is calculated from the popularity of all the artist's tracks. */
  popularity: number;
  type: "artist";
  /** The [Spotify URI](https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids) for the artist. */
  uri: string
};

declare type TrackObject = {
  /** The album on which the track appears. The album object includes a link in href to full information about the album. */
  album: Album;
  /** The artists who performed the track. Each artist object includes a link in href to more detailed information about the artist. */
  artists: ArtistObject[];
  available_markets: (keyof typeof Country)[];
  /** The disc number (usually 1 unless the album consists of more than one disc). */
  disc_number: number;
  /** The track length in milliseconds. */
  duration_ms: number;
  /** Whether or not the track has explicit lyrics ( true = yes it does; false = no it does not OR unknown). */
  explicit: boolean;
  /** Known external IDs for the track. */
  external_ids: {
    /** [International Standard Recording Code](http://en.wikipedia.org/wiki/International_Standard_Recording_Code) */
    isrc: string;
    /** [International Article Number](http://en.wikipedia.org/wiki/International_Article_Number_%28EAN%29) */
    ean: string;
    /** [Universal Product Code](http://en.wikipedia.org/wiki/Universal_Product_Code) */
    upc: string
  };
  /** Known external URLs for this track. */
  external_urls: {
    spotify: string
  };
  /** A link to the Web API endpoint providing full details of the track. */
  href: string;
  /** The [Spotify](https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids) ID for the track. */
  id: string;
  /** Part of the response when [Track Relinking](https://developer.spotify.com/documentation/web-api/concepts/track-relinking) is applied. If true, the track is playable in the given market. Otherwise false. */
  is_playable: boolean;
  /** Part of the response when [Track Relinking](https://developer.spotify.com/documentation/web-api/concepts/track-relinking) is applied, and the requested track has been replaced with different track. The track in the linked_from object contains information about the originally requested track. */
  linked_from: {};
  restrictions: {
    /** The reason for the restriction. Albums may be restricted if the content is not available in a given market, to the user's subscription type, or when the user's account is set to not play explicit content. Additional reasons may be added in the future */
    reason: "market" | "product" | "explicit"
  };
  /** The name of the track. */
  name: string;
  /** The popularity of the track. The value will be between 0 and 100, with 100 being the most popular. */
  popularity: number;
  /** A link to a 30 second preview (MP3 format) of the track. Can be nul */
  preview_url: string | null;
  /** The number of the track. If an album has several discs, the track number is the number on the specified disc. */
  track_number: number;
  type: "track";
  uri: string;
  /** The [Spotify URI](https://developer.spotify.com/documentation/web-api/concepts/spotify-uris-ids) for the track. */
  is_local: boolean;
};

declare type PlayHistoryObject = {
  /** The track the user listened to. */
  track: TrackObject;
  /** The date and time the track was played. */
  played_at: string;
  /** The context the track was played from. */
  context: ContextObject;
};