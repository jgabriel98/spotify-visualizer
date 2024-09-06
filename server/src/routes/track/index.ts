import { Router } from 'express';
import { getTrackAudio } from '../../lib/track';
import { TrackData } from '../../models';

const router = Router();

function validateAllTrackFields(t: TrackData) {
  if (!t.artist_name) return "artist_name";
  if (!t.track_id) return "track_id"
  if (!t.track_name) return "track_name"
  if (!t.track_duration_ms) return "track_duration_ms"
}

type ReqQueryParams = TrackData;

router.get<{}, any, never, ReqQueryParams>('/', async (req, res) => {
  const missingField = validateAllTrackFields(req.query);
  if(missingField) res.status(400).send(`missing "${missingField}"`);

  const filePath = await getTrackAudio(req.query);
  if (!filePath) return res.status(404);

  return res.status(200).sendFile(filePath, { root: '.' });
});


export default router;