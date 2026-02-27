import { DragOptions } from '@neodrag/solid';
import { useNavigate } from '@solidjs/router';
import { createComputed, createEffect, createSignal, Match, onCleanup, onMount, Switch } from 'solid-js';
import { getStoredAuthToken } from '~/lib/spotify-auth';
import { startWatcher, stopWatcher } from '~/lib/spotify-playback-listener/playback-status-guesser';
import SpotifyApi from '~/services/spotify-api';
import { preFetchTrackStream } from '~/services/track-audio-api';
import { CurrentlyPlayingTrack } from '~/services/types/spotify-api.interface';
import AudioVisualizer, { PlaybackState } from '../components/AudioVisualizer/AudioVisualizer';
import StaticBackground from '../components/StaticBackground/StaticBackground';
import TrackVisualizer from '../components/TrackVisualizer/TrackVisualizer';
import './App.css';
import { useSettings } from './settings/context';

export const defaultDragOptions: DragOptions = {
  bounds: '#container',
  cancel: '.resizer, .rotator',
};

function checkQueueChanged(prev: TrackObject[], next: TrackObject[]) {
  if (prev.length != next.length) return false;
  const anyDifferent = prev.some((p, idx) => p.id !== next[idx].id)
  return !anyDifferent;
}

function App() {
  const navigate = useNavigate();
  const [settings] = useSettings();

  const [spotifyApi, setSpotifyApi] = createSignal<SpotifyApi>();
  const [currentTrack, setCurrentTrack] = createSignal<CurrentlyPlayingTrack | null>(null);
  const [playbackState, setPlaybackState] = createSignal<PlaybackState>({
    isPlaying: false,
    progress_ms: null
  });
  const [trackQueue, setTrackQueue] = createSignal<TrackObject[]>([], {
    equals: checkQueueChanged
  })

  onMount(async () => {
    const tk = getStoredAuthToken();
    if (!tk) return navigate('/auth', { replace: true });

    setSpotifyApi(new SpotifyApi({
      accessToken: tk.access_token,
      refreshToken: tk.refresh_token
    }));
  });

  createComputed(() => {
    const spotify = spotifyApi();
    if (!spotify) return;
    startWatcher(spotify,
      {
        onNewTrack: (track) => setCurrentTrack(track),
        onPlayStateUpdate: (isPlaying, progress_ms) => setPlaybackState({ isPlaying, progress_ms }),
        onQueueFetch: (queue) => setTrackQueue(queue.queue),
        intervalMs: 5000
      },
    );
  })
  onCleanup(stopWatcher);

  createEffect(() => {
    preFetchTrackStream(trackQueue());
  })

  return (
    <div id='container' style={{ height: '100%', width: '100%' }}>
      {/* 
      --autoplay-policy=no-user-gesture-required 
      https://stackoverflow.com/questions/49921453/how-to-allow-video-autoplay-in-a-google-chrome-kiosk-app-in-version-66-or-later
      

      chrome://flags/#Insecure-origins-treated-as-secure
      */}
      
      <TrackVisualizer playingTrack={currentTrack()} />

      <Switch>
        <Match when={settings().background === "audioBars"}>
          <AudioVisualizer playingTrack={currentTrack()} playbackState={playbackState()} />
        </Match>
        <Match when={settings().background === "accentColor"}>
          <StaticBackground playingTrack={currentTrack()} />
        </Match>
      </Switch>
    </div>
  )
}

export default App
