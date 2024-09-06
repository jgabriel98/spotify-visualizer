import AudioMotionAnalyzer from 'audiomotion-analyzer';
import { createEffect, onCleanup, onMount } from 'solid-js';
// @ts-ignore
import { moveable, remoteStyle } from '~/UI/directives';
import './AudioBarsAnimation.css';

interface AudioBarsAnimationProps {
  stream?: MediaStream;
  mediaRef: HTMLMediaElement;
  accentColor?: string | string[];
}

// pos (position) is relative to top of screen.
const TOP_GRADIENT_POS = 0.5;
const BOTTTOM_GRADIENT_POS = 0.8;
function getGradientPos(idx: number, length: number) {
  if (length <= 1) return 1.0;

  const range = BOTTTOM_GRADIENT_POS - TOP_GRADIENT_POS;
  const step = range / (length - 1);
  const pos = TOP_GRADIENT_POS + (idx) * step;
  return pos;
}


function AudioBarsAnimation(props: AudioBarsAnimationProps) {
  let canvasRef: HTMLCanvasElement | undefined;
  let audioAnalyzer: AudioMotionAnalyzer;

  onMount(() => {
    if (!audioAnalyzer) audioAnalyzer = new AudioMotionAnalyzer(undefined, {
      canvas: canvasRef,
      mode: 6,
      showBgColor: false,
      showScaleX: false,
      ledBars: true,
      barSpace: 0.5,
      showFPS: import.meta.env.DEV,
      fftSize: 8192,
      frequencyScale: 'log',

      linearAmplitude: true,
      linearBoost: 2.5,
      smoothing: 0.5,
      maxDecibels: -10,
      // minDecibels: -75,
      channelLayout: 'single',
    });
    audioAnalyzer.disconnectOutput()
  });

  createEffect(() => {
    if (!props.accentColor) return;
    /* to switch to a new custom gradient */
    audioAnalyzer.registerGradient('trackAccentColor', {
      bgColor: '',
      colorStops: typeof props.accentColor === "string" ? [
        props.accentColor
      ] : props.accentColor.map((c, idx, arr) => (
        { color: c, pos: getGradientPos(idx, arr.length) }
      ))
    })
    audioAnalyzer.gradient = 'trackAccentColor';
  })


  createEffect(() => {
    if (props.stream) {
      audioAnalyzer.disconnectInput()
      const audiosource = audioAnalyzer.audioCtx.createMediaStreamSource(props.stream)
      audioAnalyzer.connectInput(audiosource);
    }
    else if (props.mediaRef) {
      audioAnalyzer.disconnectInput()
      audioAnalyzer.connectInput(props.mediaRef);
      props.mediaRef?.addEventListener('play', () => {
        audioAnalyzer.audioCtx.resume();
      })
    }
  });

  onCleanup(() => audioAnalyzer.disconnectInput());

  return (
    <div
      class='audiobarVisualizer'
      use:moveable={{ rotateStepDeg: 5 }}
      use:remoteStyle={{ key: 'audiobar' }}
    >
      <canvas ref={canvasRef} />
    </div>
  )
}

export default AudioBarsAnimation;