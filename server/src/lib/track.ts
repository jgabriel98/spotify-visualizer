import { youtube } from '@googleapis/youtube';
import chalk from "chalk";
import fs from "fs";
import { Duration } from "luxon";
import { YtDlp } from "ytdlp-nodejs";
import { TrackData } from "../models";

const CACHE_DIR = './cache/tracks'

const ytdlp = new YtDlp();

const ytSearch = youtube({ version: 'v3', auth: process.env.YT_SEARCH_API_KEY })

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const trackIdMapTable: {
  [trackId: string]: string | null
} = {}

export async function getTrackAudio(track: TrackData) {
  const yt_videoId = await searchYoutubeVideoId(track);
  if (!yt_videoId) return null;

  const { track_id } = track;
  const promise = new Promise<string>((resolve, reject) => {
    const path = `${CACHE_DIR}/${track_id}.mp3`;
    if (fs.existsSync(path)) return resolve(path);

    const output = fs.createWriteStream(path);
    const timediff = { start: -1, finish: -1 };

    ytdlp
      .stream(`https://www.youtube.com/watch?v=${yt_videoId}`)
      .format({ filter: 'audioonly', type: 'mp3' })
      .on('start', () => timediff.start = Date.now())
      .on('end', () => {
        timediff.finish = Date.now();
        const downloadTime = (timediff.finish - timediff.start) / 1000;
        console.log(chalk.gray(
          `Took ${downloadTime}s to download track: ${track.track_name}`
        ));
      })
      .on('error', (err) => reject(err))
      .pipe(output);

    output.on('close', () => resolve(path));
  });

  return promise;
}


function getByClosestDuration<T extends { duration: number, id: string }>(arr: T[], targetDuration: number) {
  let closestVal = Math.abs(arr[0].duration - targetDuration);
  let closestIdx = 0;

  for (let i = 1; i < arr.length; i++) {
    const diff = Math.abs(arr[i].duration - targetDuration)
    if (diff < closestVal) {
      closestIdx = i;
      closestVal = diff
    }
  }

  return arr[closestIdx];
}

async function searchYoutubeVideoId(req: TrackData) {
  const cachedSearch = trackIdMapTable[req.track_id];
  if (cachedSearch !== undefined) return cachedSearch;

  const { artist_name, track_name, track_duration_ms } = req;
  const artistQuery = typeof artist_name === 'string' ? artist_name : artist_name[0];
  const searchQuery = `${track_name} ${artistQuery}`

  // const searchResults = await YouTube.search(searchQuery, { type: 'video', limit: 10 });
  const _searchResults = await ytSearch.search.list({
    part: ['id'],
    fields: 'items/id/videoId',
    q: searchQuery,
    type: ['video']
  })

  if (!_searchResults.data.items || _searchResults.data.items.length === 0) return null;

  const videoIds = _searchResults.data.items
    .map(v => v.id?.videoId)
    .filter(id => id !== undefined && id !== null);

  const videoDetails = await ytSearch.videos.list({
    part: ['id', 'contentDetails'],
    fields: 'items/id, items/contentDetails/duration',
    id: videoIds
  }).then(res => res.data.items?.map(v => ({
    id: v.id!,
    duration: Duration.fromISO(v.contentDetails?.duration ?? '').toMillis()
  })));

  if (!videoDetails || videoDetails.length === 0) return null;


  const searchMatch = getByClosestDuration(videoDetails, track_duration_ms);
  let searchMatchUrl: string | null = searchMatch.id;
  // 3 sec difference --> bad video audio
  if (isNaN(searchMatch.duration) || Math.abs(searchMatch.duration - track_duration_ms) > 3000)
    searchMatchUrl = null;

  trackIdMapTable[req.track_id] = searchMatchUrl;
  return searchMatchUrl;
}