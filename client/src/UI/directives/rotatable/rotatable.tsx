import { Accessor, createComputed, onCleanup } from "solid-js";
import { render } from "solid-js/web";
import './rotatable.css'

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      rotatable: RotatableOptions
    }
  }
}

type RotatableOptions = {
  /** defaults to `5` */
  stepDeg?: number;
} | undefined;




export default function rotatable(rotatableRef: HTMLDivElement, options: Accessor<RotatableOptions>) {
  let rotatorRef!: HTMLDivElement;

  createComputed(() => {
    rotatableRef.classList.add('rotatable');
    render(() => <div ref={rotatorRef} class="rotator" />, rotatableRef);
  });

  let centerX: number;
  let centerY: number;
  const step = options()?.stepDeg ?? 5;


  const onMouseDown = (_: MouseEvent) => {
    document.body.style.cursor = 'grabbing';
    const rotatableRect = rotatableRef.getBoundingClientRect();
    centerX = rotatableRect.left + rotatableRect.width / 2;
    centerY = rotatableRect.top + rotatableRect.height / 2;

    // console.log({centerX, centerY, mouseX: event.clientX, mouseY: event.clientY})

    // externalResizeObserver.unobserve(resizableRef);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
  createComputed(() => rotatorRef.addEventListener("mousedown", onMouseDown))


  const onMouseMove = (event: MouseEvent) => {
    const dX = (event.clientX) - (centerX);
    const dY = (event.clientY) - (centerY);
    var degree = Math.atan2(dY, dX) * 180 / Math.PI;

    degree = Math.floor(degree/step) * step;

    rotatableRef.style.rotate = `${degree+90}deg`;
  };

  const onMouseUp = (_: MouseEvent) => {
    document.body.style.cursor = 'auto';
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    // externalResizeObserver.observe(resizableRef);
  }

  onCleanup(() => {
    rotatorRef.removeEventListener("mousedown", onMouseDown);
    // externalResizeObserver.unobserve(resizableRef);
    // externalResizeObserver.disconnect();
  })

}