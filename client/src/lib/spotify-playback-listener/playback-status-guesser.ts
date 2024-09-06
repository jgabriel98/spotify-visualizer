import SpotifyApi from "../../services/spotify-api";
import { CurrentlyPlayingTrack, PlaybackState, UserQueue } from "../../services/types/spotify-api.interface";
import TimeoutPromise from "../utils/timeout-promise";

type TrackLike = PlaybackState | CurrentlyPlayingTrack;

function scheduleNextFetch_v2<T>(fetch: () => Promise<T>, delayMs: number) { 
  return new TimeoutPromise<T>((resolve, reject) => {
    console.warn(`waited ${delayMs / 1000}s already, executing fetch`)
    fetch().then(resolve).catch(reject)
  }, delayMs)
}

async function scheduleFetchAfterCurrentSongEnds_v2(spotify: SpotifyApi, {data: track, fetchLatency}: {data: TrackLike, fetchLatency: number}, onTrackEnded: (newTrack: TrackLike | null) => void, re_scheduleCount = 0) {
  spotify.getCurrentPlaying = spotify.getCurrentPlaying.bind(spotify);

  const checkFetchedTooEarly = (fetchedTrack: TrackLike | null) => {
    return fetchedTrack?.item.id === track.item.id;
  }

  const timeLeftToNextSong = calcTrackDurationLeft(track, fetchLatency);
  const fetchedTrack = await scheduleNextFetch_v2(spotify.getCurrentPlaying, timeLeftToNextSong);

  if (!fetchedTrack.data) return onTrackEnded(fetchedTrack.data);

  const fetchedTooSoon = checkFetchedTooEarly(fetchedTrack.data);
  if (fetchedTooSoon) {
    await scheduleFetchAfterCurrentSongEnds_v2(spotify, fetchedTrack, onTrackEnded, ++re_scheduleCount);
  } else {
    if(re_scheduleCount) console.debug(`too early! re-scheduled ${re_scheduleCount} times`);
    else console.debug(`bullseye! got it on first schedule`);
    onTrackEnded(fetchedTrack.data);
  }
}

function calcTrackDurationLeft(track: TrackLike, clientServerLatency: number = 0) {
  const oneWayTripLatency = clientServerLatency /2;
  // 25ms of minimum threshhold, to avoid spam of requests
  const timeLeft = track.item.duration_ms - track.progress_ms;
  if (timeLeft === 0) return 0;
  return track.item.duration_ms - track.progress_ms + oneWayTripLatency
}

// @ts-ignore
function calcTrackProgress(track: TrackLike, clientServerLatency: number = 0) {
  const oneWayTripLatency = clientServerLatency /2;
  return track.progress_ms + oneWayTripLatency;
}

async function watch_v2(spotify: SpotifyApi, onMusicChangedCallback: (track: TrackLike | null) => void, nextTickIn_ms: number) {
  const currentTrackFetchResponse = await spotify.getCurrentPlaying();
  const {data: currentTrack, fetchLatency} = currentTrackFetchResponse;

  const handleMusicChanged = (t: TrackLike | null) => {
    onMusicChangedCallback(t)
    lastPlayingTrackId = t?.item.id;
  }

  if (currentTrack?.item.id != lastPlayingTrackId) {
    console.debug("QUEM DETECTOU A TROCA DE MUSICA: watcher | " + (currentTrack ? `progresso da musica: ${currentTrack.progress_ms / 1000}s | nome: ${currentTrack.item.name}` : "player ficou inativo"));
    handleMusicChanged(currentTrack);
  }
  if (!currentTrack) return currentTrackFetchResponse;
  if (!currentTrack.is_playing) return currentTrackFetchResponse;

  const isLastTickBeforeTrackChange = calcTrackDurationLeft(currentTrack, fetchLatency) <= nextTickIn_ms;
  if (isLastTickBeforeTrackChange)
    scheduleFetchAfterCurrentSongEnds_v2(spotify, currentTrackFetchResponse, async (newTrack) => {
      console.debug("QUEM DETECTOU A TROCA DE MUSICA: scheduler | " + (newTrack ? `progresso da musica: ${newTrack.progress_ms / 1000}s | nome: ${newTrack.item.name}` : "player ficou inativo"));
      handleMusicChanged(newTrack);
    });
  
  return currentTrackFetchResponse;
}

let lastPlayingTrackId: string | undefined;

let spotifyPlaybackWatcher: ReturnType<typeof setInterval> | undefined;

interface WatcherOptions {
  onNewTrack: (newTrack: PlaybackState | CurrentlyPlayingTrack | null) => void, 
  onPlayStateUpdate: (isPlaying: boolean, progress_ms: number | null) => void,
  onQueueFetch: (queue: UserQueue) => void
  intervalMs: number
}

export async function startWatcher(spotify: SpotifyApi, {onNewTrack, onPlayStateUpdate, onQueueFetch, intervalMs} : WatcherOptions) {
  if (spotifyPlaybackWatcher) return console.warn('ih rapaz... ja tem um watcher ativo... algo ta zoado')

  const onMusicChanged = (newTrack: TrackLike | null) => {
    onNewTrack(newTrack);
    if(newTrack) onPlayStateUpdate(newTrack.is_playing, newTrack.progress_ms);
    else onPlayStateUpdate(false, null);
    //starts itself again in case that newTrack duration is shorter than intervalMs
    stopWatcher();
    start();
  }

  const runTick = async () => {
    const {data: track} = await watch_v2(spotify, onMusicChanged, intervalMs);
    spotify.getUserQueue().then(onQueueFetch);
    const processDelay_ms = 160;
    // const progress_ms = -(calcTrackProgress() + processDelay_ms);
    if(track) onPlayStateUpdate(track.is_playing, track.progress_ms - processDelay_ms)
    else onPlayStateUpdate(false, null)
  }

  const start = () => {
    spotifyPlaybackWatcher = setInterval(runTick, intervalMs);
    runTick();
  }

  start();
}

export function stopWatcher() {
  clearInterval(spotifyPlaybackWatcher)
  spotifyPlaybackWatcher = undefined;
}