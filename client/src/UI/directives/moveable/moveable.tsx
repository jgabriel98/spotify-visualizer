import Moveable from "moveable";
import { Accessor, createEffect, createRenderEffect, createSignal, createUniqueId, JSX, onCleanup } from "solid-js";
import { render } from "solid-js/web";
import { waitForElement } from "~/utils/waitForElement";
import './moveable.css';

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      moveable: MoveableOptions
    }
  }
}

type MoveableOptions = {
  /** defaults to `5` */
  rotateStepDeg?: number;
  /** defaults to `false` */
  keepRatio?: boolean
} | undefined;


export default function moveable(movableRef: HTMLDivElement, options: Accessor<MoveableOptions>) {
  const moveableId = createUniqueId();
  const [isFocused, setIsFocused] = createSignal(false);
  const [isInteracting, setIsInteracting] = createSignal(false);

  const movable = new Moveable(document.body, {
    className: moveableId,
    draggable: true,
    resizable: true,
    rotatable: true,
    keepRatio: options()?.keepRatio,
    edge: ['se'],
    hideDefaultLines: true,
    throttleRotate: options()?.rotateStepDeg,
    // required to integrate with use:remoteStyle()
    useMutationObserver: true
  });
  let movableResizersRefs: (HTMLDivElement)[] | undefined;
  let movableRotatorRef: HTMLDivElement | null | undefined;


  createEffect(() => { movable.target = movableRef; });
  onCleanup(() => { movable.destroy() });

  movableRef.addEventListener('mouseover', () => setIsFocused(true));
  movableRef.addEventListener('mouseleave', () => setIsFocused(false));

  createRenderEffect(() => {
    const display = (isFocused() || isInteracting()) ? 'initial' : 'none';
    if (movableResizersRefs) movableResizersRefs.forEach(el => el.style.display = display);
    if (movableRotatorRef) movableRotatorRef.style.display = display;
  });

  waitForElement<HTMLDivElement>(`.${moveableId}`).then(el => {
    movableResizersRefs = Array.from(el.querySelectorAll<HTMLDivElement>('.moveable-direction'));
    movableRotatorRef = el.querySelector<HTMLDivElement>('.moveable-rotation');
    if (movableRotatorRef) render(() => <RotatableArea onHover={() => setIsFocused(true)} />, movableRotatorRef)
    el.addEventListener('mouseover', () => setIsFocused(true));
    el.addEventListener('mouseleave', () => setIsFocused(false));
  })

  /* draggable */
  movable.on("dragStart", () => {
    setIsInteracting(true);
  }).on("drag", ({ target, transform }) => {
    // target!.style.left = `${left}px`;
    // target!.style.top = `${top}px`;
    target!.style.transform = transform;
  }).on("dragEnd", () => {
    setIsInteracting(false);
  });

  /* resizable */
  movable.on("resizeStart", () => {
    setIsInteracting(true)
  }).on("resize", ({ target, width, height, delta }) => {
    delta[0] && (target!.style.width = `${width}px`);
    delta[1] && (target!.style.height = `${height}px`);
  }).on("resizeEnd", () => {
    setIsInteracting(false);
  });

  /* rotatable */
  movable.on("rotateStart", () => {
    setIsInteracting(true)
  }).on("rotate", ({ target, transform }) => {
    target!.style.transform = transform;
  }).on("rotateEnd", () => {
    setIsInteracting(false);
  });
}

interface RotatableAreaProps {
  onHover: JSX.CustomEventHandlersCamelCase<HTMLDivElement>['onMouseEnter']
}

const RotatableArea = ({ onHover }: RotatableAreaProps) => <div
  onMouseEnter={onHover}
  style={{
    position: 'absolute',
    top: '-16px',
    height: 'calc(100% + 16px)',
    width: '48px',
    left: '-16px',
  }} />