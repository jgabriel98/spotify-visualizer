import { useNavigate } from "@solidjs/router";
import QRCode from 'qrcode';
import { io } from "socket.io-client";
import { createComputed, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { getStoredAuthToken, handleNewSpotifyAuthorizationCode } from "~/lib/spotify-auth";
import { buildRequestUserAuthorizationURL } from "~/lib/spotify-auth/service-api";
import { getUrlSearchParams } from "~/utils/fetch";
import './Auth.css';

const wsEndpoint = `${location.protocol}//${location.hostname}:${import.meta.env.VITE_SERVER_PORT}`
const webSocket = io(wsEndpoint, { autoConnect: false });

export function Auth() {
  const navigate = useNavigate();
  const params = getUrlSearchParams(['code', 'state']);

  if (params.state) return <ExternalAuth />;

  let QRCodeCanvasRef: HTMLCanvasElement | undefined;
  const [spotifyAuthUrl, setSpotifyAuthUrl] = createSignal<string>();
  const [authState, setAuthState] = createSignal<string>();

  const accessToken = getStoredAuthToken();
  if (accessToken) navigate('/', { replace: true });
  onMount(() => webSocket.connect())

  webSocket.once('connect', () => {
    buildRequestUserAuthorizationURL()
      .then(url => {
        const state = url.searchParams.get('state');
        setAuthState(state!);
        setSpotifyAuthUrl(url.toString());
      });
  });

  createComputed(() => {
    const authUrl = spotifyAuthUrl();
    if (!authUrl || !QRCodeCanvasRef) return;

    QRCode.toCanvas(QRCodeCanvasRef, authUrl, (err) => {
      if (err) console.error(err);
      else webSocket.emit('qrCodeAuth:init', authState());
    });
  })

  webSocket.once('qrCodeAuth:authenticated', async (code: string) => {
    const state = authState()!;
    await handleNewSpotifyAuthorizationCode(code);

    webSocket.emit("qrCodeAuth:complete", state);
    navigate('/', { replace: true });
  })

  onCleanup(() => webSocket.disconnect());

  // const onLocalAuth = () => webSocket.emit('qrCodeAuth:abort', authState());

  return <div class="QRCodeContainer">
    Scan the QR code to authenticate your Spotify account
    
    <canvas ref={QRCodeCanvasRef} />
    {/* <button onClick={onLocalAuth}>
      authenticate mannualy
    </button> */}
  </div>
}

export function ExternalAuth() {
  const { code, state } = getUrlSearchParams(['code', 'state']);
  const [countDown, setCountDown] = createSignal(5000);
  onMount(() => webSocket.connect())

  webSocket.once('connect', async () => {
    const { status, message } = await webSocket.emitWithAck('qrCodeAuth:authenticated', state, code);
    if (status === 'error') console.error(message);
    window.alert(message)
  });

  setInterval(() => setCountDown(prev => prev - 1000), 1000);

  createEffect(() => {
    if (countDown() <= 0) window.close();
  })


  return <>
    <div>All good! you can close this tab now</div>
    <div>(it will close itself in {countDown() / 1000} seconds)</div>
  </>
}
