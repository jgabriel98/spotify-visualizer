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
  let audioRef: HTMLAudioElement = undefined!;
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
    if (!props.playingTrack || !audioRef) return;
    getTrackStream(props.playingTrack.item)
      .then(mediaBlob => {
        // mutes to don't mess with visuals (don't show wrong visuals)

        const audioUrl = URL.createObjectURL(mediaBlob);
        audioRef.src = audioUrl;

        // re-updates progress because audio source just changed
        // props.mediaRef.currentTime = props.playbackState.progress_ms! / 1000;
        audioRef.currentTime = 0;
        audioRef.play();
        audioRef.muted = false;

        console.log('audio file obtained. Updating <audio />')
      });
  })

  createEffect(() => {
    // console.logTime('adjusting progress state: ', props.playbackState.progress_ms ? props.playbackState.progress_ms / 1000 : 'player inactive')
    if (!props.playbackState.progress_ms) return audioRef.pause();

    audioRef.currentTime = props.playbackState.progress_ms / 1000;
    if (props.playbackState.isPlaying) audioRef.play();
    else audioRef.pause();
  })


  return <>
    <audio ref={audioRef} hidden muted />
    <AudioBarsAnimation mediaRef={audioRef} accentColor={accentColor()} />
  </>
}

export default AudioVisualizer;