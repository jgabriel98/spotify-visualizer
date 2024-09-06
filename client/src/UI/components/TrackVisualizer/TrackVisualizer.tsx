import { createDraggable } from '@neodrag/solid';
import { createEffect, createSignal, Show, Suspense } from 'solid-js';
import { CurrentlyPlayingTrack } from '~/services/types/spotify-api.interface';
// @ts-ignore
import { moveable, remoteStyle } from '~/UI/directives';
import './TrackVisualizer.css';

interface TrackVisualizerProps {
  playingTrack: CurrentlyPlayingTrack | null
}

function TrackVisualizer(props: TrackVisualizerProps) {
  // @ts-ignore
  const { draggable } = createDraggable();
  const [currentSongData, setCurrentSongData] = createSignal<{
    albumImage: string,
    trackName: string,
    artistName: string,
  }>()

  createEffect(() => {
    if (!props.playingTrack) return setCurrentSongData();

    const { item } = props.playingTrack;
    setCurrentSongData({
      albumImage: item.album.images[1].url,
      trackName: item.name,
      artistName: item.artists.map(artist => artist.name).join(', ')
    });
  });

  return (
    <Suspense fallback={<div>suspense...</div>}>
      <Show when={currentSongData()}>
        <div class="trackVisualizer"
          use:remoteStyle={{ key: 'trackVisualizer' }}

          use:moveable={{
            rotateStepDeg: 5,
            keepRatio: true
          }}
        >
          <div style={{ height: '100%', width: '100%' }}>
            <img src={currentSongData()!.albumImage} />
          </div>

          <div class="trackDescription" style={{ display: "flex", "flex-direction": "column" }}>
            <div >{currentSongData()!.trackName}</div>
            <div >{currentSongData()!.artistName}</div>
          </div>
        </div>
      </Show>
    </Suspense>


  )
};

export default TrackVisualizer;