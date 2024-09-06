export function waitForElement<E extends Element>(selector: Parameters<typeof document.querySelector>[0]) {
  return new Promise<E>(resolve => {
    const el = document.querySelector<E>(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const el = document.querySelector<E>(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}