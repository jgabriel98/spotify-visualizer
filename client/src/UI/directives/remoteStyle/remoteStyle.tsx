import { Accessor, createEffect } from "solid-js";
import createRemoteSignal from "~/lib/remote-signal";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      remoteStyle: RemoteStyleOptions
    }
  }
}

type RemoteStyleOptions = {
  /** used to indentify across all remote persisted styles. If empty, the component `id` is used instead. */
  key?: string
} | undefined;


export default function remoteStyle(stylableRef: HTMLDivElement, options?: Accessor<RemoteStyleOptions>) {
  const initialStyle = stylableRef.style.cssText;
  const remoteKey = options?.()?.key ?? stylableRef.id
  if (!remoteKey) return console.warn("remoteStyle requires either key option or the element to have id set")

  const [style, setStyle] = createRemoteSignal<string>(
    `${remoteKey}-remote_style`,
    initialStyle
  );

  createEffect(() => {
    const newStyle = style();
    if (stylableRef.style.cssText !== newStyle)
      stylableRef.style.cssText = newStyle;
  })

  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutationRecord) {
      const styleAttributeText = (mutationRecord.target as HTMLDivElement).style.cssText
      setStyle(styleAttributeText);
    });
  });
  observer.observe(stylableRef, { attributes: true, attributeFilter: ['style'] });
}