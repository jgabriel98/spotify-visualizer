import { Router } from 'express';
import { getTrackAudio } from '../../../lib/track';
import { TrackData } from '../../../models';
import chalk from 'chalk';

const router = Router();

function validateAllTrackFields(t: TrackData) {
  if (!t.artist_name) return "artist_name";
  if (!t.track_id) return "track_id"
  if (!t.track_name) return "track_name"
  if (!t.track_duration_ms) return "track_duration_ms"
}

type ReqBodyParams = TrackData[];

/** Endpoint for pre downloading audio files */
router.post<{}, any, ReqBodyParams, never>('/', async (req, res) => {
  const track_list = req.body;
  if (!Array.isArray(track_list)) return res.sendStatus(400);

  for (const t of track_list) {
    const missingField = validateAllTrackFields(t);
    if (missingField) return res.status(400).send(`missing "${missingField}"`);

    let videoId: string | null = null;
    try { videoId = await getTrackAudio(t) }
    catch (e) { 
      console.error(chalk.red(`error downloading track ${t.track_id}:`), e);
    }
    if (!videoId) console.warn(`could not find youtube video for track ${t.track_id} | ${t.track_name} - ${t.artist_name}`)
  };

  return res.sendStatus(202);
});


export default router;