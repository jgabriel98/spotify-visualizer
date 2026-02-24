import chalk from "chalk";
import fs from "fs";
import YouTube, { type Video } from 'youtube-sr';
import { YtDlp } from "ytdlp-nodejs";
import { TrackData } from "../models";

const CACHE_DIR = './cache/tracks'

const ytdlp = new YtDlp();

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const trackIdMapTable: {
  [trackId: string]: string | null
} = {}

export async function getTrackAudio(track: TrackData) {
  const yt_url = await searchYoutubeUrl(track);
  if (!yt_url) return null;

  const { track_id } = track;
  const promise = new Promise<string>((resolve, reject) => {
    const path = `${CACHE_DIR}/${track_id}.mp3`;
    if (fs.existsSync(path)) return resolve(path);

    const output = fs.createWriteStream(path);
    const timediff = { start: -1, finish: -1 };

    ytdlp
      .stream(yt_url)
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


function getByClosestDuration(arr: Video[], targetDuration: number) {
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

async function searchYoutubeUrl(req: TrackData) {
  const cachedSearch = trackIdMapTable[req.track_id];
  if (cachedSearch !== undefined) return cachedSearch;

  const { artist_name, track_name, track_duration_ms } = req;
  const artistQuery = typeof artist_name === 'string' ? artist_name : artist_name[0];
  const searchQuery = `${track_name} ${artistQuery}`

  const searchResults = await YouTube.search(searchQuery, { type: 'video', limit: 10 });

  const searchMatch = getByClosestDuration(searchResults, track_duration_ms);
  let searchMatchUrl: string | null = searchMatch.url;
  // 3 sec difference --> bad video audio
  if (Math.abs(searchMatch.duration - track_duration_ms) > 3000)
    searchMatchUrl = null;

  trackIdMapTable[req.track_id] = searchMatchUrl;
  return searchMatchUrl;
}