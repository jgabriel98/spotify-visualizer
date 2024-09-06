import ytdl from "@distube/ytdl-core";
import fs from "fs";
import YouTube, { Video } from 'youtube-sr';
import { TrackData } from "../models";
import chalk from "chalk";

const CACHE_DIR = './cache/tracks'

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

    //RETORNA CHUNKS DA STREAM: ytdl(url).asIndexedPairs
    const stream = ytdl(yt_url, {
      quality: 'lowest',
      filter: 'audioonly'
    });

    const output = fs.createWriteStream(path);

    const startTime = Date.now();
    stream.on("end", () => {
      const downloadTime = (Date.now() - startTime) / 1000;
      console.log(chalk.gray(
        `Took ${downloadTime}s to download track: ${track.track_name}`
      ));
    });
    stream.on('error', (err) => reject(err));
    output.once('close', () => {
      resolve(path);
    });

    // how to save stream into buffer and cache it
    // const chunks = []
    // stream.on('data', (chunk) => {
    //   chunks.push(chunk)
    // })
    // stream.on('end', () => {
    //   
    //   cacheTrack(trackId, Buffer.concat(chunks))
    // })

    stream.pipe(output);
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