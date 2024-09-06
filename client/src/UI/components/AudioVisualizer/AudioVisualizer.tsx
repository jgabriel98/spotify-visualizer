import Vibrant from 'node-vibrant';
import { Swatch } from 'node-vibrant/lib/color';
import { createEffect, createSignal } from 'solid-js';
import { getTrackStream } from '~/services/track-audio-api';
import { CurrentlyPlayingTrack } from '~/services/types/spotify-api.interface';
import AudioBarsAnimation from './AudioBarsAnimation';


export type PlaybackState = {
  isPlaying: boolean;
  /** `null` when player is inactive */
  progress_ms: number | null;
}

interface AudioVisualizerProps {
  mediaRef: HTMLMediaElement;
  playingTrack: CurrentlyPlayingTrack | null;
  playbackState: PlaybackState;
}

// @ts-ignore
const makeRedish = (color: Swatch) => {
  const tint_factor = 1.0;
  const new_r = color.r + ((255 - color.r) * tint_factor);
  return new Swatch([new_r, color.g, color.b], color.population);
}


function AudioVisualizer(props: AudioVisualizerProps) {
  const [accentColor, setAccentColor] = createSignal<string | string[]>();

  createEffect((prevTrackId) => {
    if (!props.playingTrack) return null;
    if (prevTrackId === props.playingTrack.item.id) return props.playingTrack;

    const images = props.playingTrack?.item.album.images;
    const smallestImage = images[images.length - 1];
    Vibrant.from(smallestImage.url).getPalette().then((p) =>
      setAccentColor([p.LightVibrant!.hex, p.LightMuted!.hex])
    )

    return props.playingTrack.item.id;
  })

  createEffect(() => {
    if (!props.playingTrack) return;
    getTrackStream(props.playingTrack.item)
      .then(mediaBlob => {
        // mutes to don't mess with visuals (don't show wrong visuals)

        const audioUrl = URL.createObjectURL(mediaBlob);
        props.mediaRef.src = audioUrl;

        // re-updates progress because audio source just changed
        // props.mediaRef.currentTime = props.playbackState.progress_ms! / 1000;
        props.mediaRef.currentTime = 0;
        props.mediaRef.play();
        props.mediaRef.muted = false;

        console.log('audio file obtained. Updating <audio />')
      });
  })

  createEffect(() => {
    // console.logTime('adjusting progress state: ', props.playbackState.progress_ms ? props.playbackState.progress_ms / 1000 : 'player inactive')
    if (!props.playbackState.progress_ms) return props.mediaRef.pause();

    props.mediaRef.currentTime = props.playbackState.progress_ms / 1000;
    if (props.playbackState.isPlaying) props.mediaRef.play();
    else props.mediaRef.pause();
  })


  return <>
    {/* <div style={{
      position: 'fixed',
      display: 'flex',
      height: '25vh',
    }}>
      <For each={colors()}>{(color) =>
        <div style={{ "background-color": color.swatch?.hex }}>
          <span>{`${color.name}  ${color.swatch?.hex}`}</span>
        </div>
      }
      </For>
      <div style={{ "background-color": dominantColor() }}>
        essa é a cor dominante
      </div>
      <For each={colors2()}>{(color) =>
        <div style={{ "background-color": color }}>
          <span>{color}</span>
        </div>
      }
      </For>
    </div> */}
    <AudioBarsAnimation mediaRef={props.mediaRef} accentColor={accentColor()} />
  </>;
}

export default AudioVisualizer;