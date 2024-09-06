const API_ENDPOINT = `${location.protocol}//${location.hostname}:${import.meta.env.VITE_SERVER_PORT}`;

export async function getTrackStream(track: TrackObject) {
  const query = new URLSearchParams({
    track_id: track.id,
    track_name: track.name,
    track_duration_ms: track.duration_ms.toString(),
    artist_name: track.artists[0].name,
  });

  const req = await fetch(`${API_ENDPOINT}/track?${query}`, {
    method: 'GET'
  });
  return await req.blob();
}

export async function preFetchTrackStream(queue: TrackObject[]) {
  const bodyPayload = queue.slice(0,10).map(t =>({
    track_id: t.id,
    track_name: t.name,
    track_duration_ms: t.duration_ms.toString(),
    artist_name: t.artists[0].name,
  }))

  return await fetch(`${API_ENDPOINT}/track/queue`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyPayload)
  });
}