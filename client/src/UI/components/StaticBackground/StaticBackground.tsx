import Vibrant from 'node-vibrant';
import { createComputed, createEffect, createSignal } from 'solid-js';
import type { CurrentlyPlayingTrack } from '~/services/types/spotify-api.interface';

interface TrackVisualizerProps {
  playingTrack: CurrentlyPlayingTrack | null
}

function StaticBackground(props: TrackVisualizerProps) {
  const [accentColor, setAccentColor] = createSignal<string>();
  const [accentColor2, setAccentColor2] = createSignal<string>();

  createComputed((prevTrackId) => {
    if (!props.playingTrack) return null;
    // avoid uneccessary compute
    if (prevTrackId === props.playingTrack.item.id) return props.playingTrack;

    const images = props.playingTrack?.item.album.images;
    const smallestImage = images[images.length - 1];

    Vibrant.from(smallestImage.url).getPalette().then((p) => {
      setAccentColor(p.LightMuted!.hex)
      setAccentColor2(p.Vibrant!.hex)
    })

    return props.playingTrack.item.id;
  })

  return (<>
    <div style={{
      "background-color": accentColor(), 
      position: 'absolute',
      height: '100%',
      width: '50%',
    }} />
    <div style={{
      "background-color": accentColor2(), 
      position: 'absolute',
      right: 0,
      height: '100%',
      width: '50%',
    }} />
  </>);
};

export default StaticBackground;