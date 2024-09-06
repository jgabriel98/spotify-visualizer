import { createDraggable, DragOptions } from "@neodrag/solid";
import { Accessor, createRenderEffect as createComputedEffect, createSignal } from "solid-js";
import { defaultDragOptions } from "~/UI/pages/App";
import createRemoteSignal from "~/lib/remote-signal";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      neoDraggable: PersistedOptions
    }
  }
}

type PersistedOptions = {
  /** used to indentify across all remote persisted styles. If empty, the component `id` is used instead. */
  key?: string
} | undefined;

type Position = NonNullable<DragOptions['position']>;

export default function neoDraggable(draggableRef: HTMLDivElement, options: Accessor<PersistedOptions>) {
  const remoteKey = options()?.key ?? draggableRef.id
  if (!remoteKey) throw new Error("remoteStyle requires either key option or the element to have id set")

  const [style, setStyle] = createRemoteSignal<Position>(
    options()?.key ?? draggableRef.id,
    { x: 0, y: 0 }
  );

  const { draggable } = createDraggable();
  const [draggableOptions, setDraggableOptions] = createSignal<DragOptions>({
    ...defaultDragOptions,
    legacyTranslate: false,
    onDrag: ({ offsetX, offsetY }) => setStyle({
        x: offsetX,
        y: offsetY
      })
  });

  createComputedEffect(() => {
    setDraggableOptions(prev => ({
      ...prev,
      position: style()
    }));
  })

  draggable(draggableRef, draggableOptions);
}