import fs, { readFileSync, existsSync, mkdirSync } from "node:fs";

const storePath = './json-storage';

if (!existsSync(storePath)) {
  mkdirSync(storePath, { recursive: true })
}

const memCache: { [key: string]: any } = {};
export function set<T>(key: string, value: T) {

  memCache[key] = value;
  const json = JSON.stringify(value);
  if(json) fs.promises.writeFile(`${storePath}/${key}.json`, json)
};

export function get<T>(key: string) {
  if (!memCache[key]) {
    const v_str = readFileSync(`${storePath}/${key}.json`).toString()
    memCache[key] = JSON.parse(v_str);
  }
  return memCache[key] as T;
}

export default {
  get,
  set
}

