const API_ENDPOINT = new URL(`${window.location.protocol}//${location.hostname}`);
API_ENDPOINT.port = import.meta.env.VITE_SERVER_PORT ?? '';

export async function getTrackStream(track: TrackObject) {
  const query = new URLSearchParams({
    track_id: track.id,
    track_name: track.name,
    track_duration_ms: track.duration_ms.toString(),
    artist_name: track.artists[0].name,
  });

  const url = new URL(API_ENDPOINT);
  url.pathname = '/track';
  url.search = query.toString();

  const req = await fetch(url, {
    method: 'GET'
  });
  return await req.blob();
}

export async function preFetchTrackStream(queue: TrackObject[]) {
  const bodyPayload = queue.slice(0, 10).map(t => ({
    track_id: t.id,
    track_name: t.name,
    track_duration_ms: t.duration_ms.toString(),
    artist_name: t.artists[0].name,
  }))

  const url = new URL(API_ENDPOINT);
  url.pathname = '/track/queue';

  return await fetch(url, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyPayload)
  });
}