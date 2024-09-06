import { DragOptions } from '@neodrag/solid';
import { useNavigate } from '@solidjs/router';
import { createComputed, createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import { getStoredAuthToken } from '~/lib/spotify-auth';
import { startWatcher, stopWatcher } from '~/lib/spotify-playback-listener/playback-status-guesser';
import SpotifyApi from '~/services/spotify-api';
import { preFetchTrackStream } from '~/services/track-audio-api';
import { CurrentlyPlayingTrack } from '~/services/types/spotify-api.interface';
import AudioVisualizer, { PlaybackState } from '../components/AudioVisualizer/AudioVisualizer';
import TrackVisualizer from '../components/TrackVisualizer/TrackVisualizer';
import './App.css';

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
  let audioRef: HTMLAudioElement | undefined;
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
    if (!tk) return navigate('/auth');

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

  const toggleMutte = () => {
    // if (!audioRef) return;
    // audioRef.muted = !audioRef.muted
  }

  return (<>
    <div id='container' style={{ height: '100%', width: '100%' }} onClick={toggleMutte}>
      {/* 
      --autoplay-policy=no-user-gesture-required 
      https://stackoverflow.com/questions/49921453/how-to-allow-video-autoplay-in-a-google-chrome-kiosk-app-in-version-66-or-later
      

      chrome://flags/#Insecure-origins-treated-as-secure
      */}
      <audio ref={audioRef} hidden muted />
      <TrackVisualizer playingTrack={currentTrack()} />
      <AudioVisualizer mediaRef={audioRef!} playingTrack={currentTrack()} playbackState={playbackState()} />
    </div>
  </>)
}

export default App
