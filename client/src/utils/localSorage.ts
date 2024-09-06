export function setLocalStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getLocalStorage<T>(key: string): T | undefined {
  const rawStored = localStorage.getItem(key);
  if (!rawStored) return undefined;

  return JSON.parse(rawStored) as T;
}

export function useLocalSorage<T>(key: string) {
  return [
    () => getLocalStorage<T>(key),
    (value: T) => setLocalStorage<T>(key, value)
  ] as const;
}