import { useNavigate } from "@solidjs/router";
import QRCode from 'qrcode';
import { createComputed, createEffect, createSignal, onMount } from "solid-js";
import { getStoredAuthToken, handleNewSpotifyAuthorizationCode } from "~/lib/spotify-auth";
import { buildRequestUserAuthorizationURL } from "~/lib/spotify-auth/service-api";
import { getUrlSearchParams } from "~/utils/fetch";
import './Auth.css';
import { webSocket } from "~/lib/websocket";


export function AuthPage() {
  const params = getUrlSearchParams(['code', 'state']);
  if (params.state && params.code) return <AuthCallbackPage />;

  const navigate = useNavigate();

  let QRCodeCanvasRef: HTMLCanvasElement | undefined;
  const [spotifyAuthUrl, setSpotifyAuthUrl] = createSignal<string>();
  const [spotifyAuthState, setSpotifyAuthState] = createSignal<string>();

  const accessToken = getStoredAuthToken();
  if (accessToken) navigate('/', { replace: true });
  onMount(() => {
    buildRequestUserAuthorizationURL().then(url => {
      const state = url.searchParams.get('state');
      setSpotifyAuthState(state!);
      setSpotifyAuthUrl(url.toString());
    });
  })


  createComputed(() => {
    const authUrl = spotifyAuthUrl();
    const authState = spotifyAuthState();
    if (!authUrl || !QRCodeCanvasRef || !authState) return;

    QRCode.toCanvas(QRCodeCanvasRef, authUrl, (err) => {
      if (err) {
        console.error(err);
        webSocket.emit('qrCodeAuth:abort', authState);
      } else {
        webSocket.emit('qrCodeAuth:init', authState);
      }
    });
  })

  // waits for authentication to complete on external device & server
  webSocket.once('qrCodeAuth:authenticated', async (code: string) => {
    await handleNewSpotifyAuthorizationCode(code);
    navigate('/', { replace: true });
  })

  return <div class="QRCodeContainer">
    Scan the QR code to authenticate your Spotify account

    <canvas ref={QRCodeCanvasRef} />
    {/* <button onClick={onLocalAuth}>
      authenticate mannualy
    </button> */}
  </div>
}

export function AuthCallbackPage() {
  const { code, state } = getUrlSearchParams(['code', 'state']) as NonNullable<{ code: string, state: string }>;
  const [countDown, setCountDown] = createSignal(5000);

  webSocket.once('connect', async () => {
    const { status, message } = await webSocket.emitWithAck('qrCodeAuth:externalAuthenticated', state, code);
    if (status != 'ok') {
      console.error(message);
      window.alert(message);
    }
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
