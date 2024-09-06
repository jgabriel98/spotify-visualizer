export function getUrlSearchParams<T extends string>(keys: Array<T>) {
  const searchParams = new URLSearchParams(window.location.search)
  const params = keys.reduce((acc, key) => {
    acc[key] = searchParams.get(key)
    return acc;
  }, {} as Record<T, string | null>)
  return params;
}

export function setUrlSearchParams(params: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  window.location.search = searchParams.toString();
}
