import { Accessor, createComputed, createEffect, onCleanup } from "solid-js";
import { render } from "solid-js/web";
import '~/assets/resize-icon-gray.png';
import './resizable.css';

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      resizable: ResizableOptions
    }
  }
}

type ResizableOptions = undefined | {
  keepRatio?: boolean
  boundTo?: HTMLElement
};

function passedBounds(boundRect: DOMRect, innerRect: DOMRect) {
  if (innerRect.right > boundRect.right) return true;
  if (innerRect.bottom > boundRect.bottom) return true;
  return false
}

function rotateMouseMovement(x: number, y: number, angle: number) {
  var radians = (Math.PI / 180) * angle,
    cos = Math.cos(radians),
    sin = Math.sin(radians),
    nx = (cos * (x)) + (sin * (y)),
    ny = (cos * (y)) - (sin * (x));
  return [nx, ny] as const;
}

// function rotatePositionOffset(rotatedXoffset: number, rotatedYoffset: number, angle: number) {
//   var radians = (Math.PI / 180) * angle,
//     cos = Math.cos(radians),
//     sin = Math.sin(radians);
  
//     let newX=0, newY=0;

//     newX = 0.5 * ((rotatedXoffset * cos) - (rotatedYoffset * sin))
//     newY = 0.5 * ((rotatedXoffset * sin) + (rotatedYoffset * cos));

//   return [newX, newY] as const;
// }


export default function resizable(resizableRef: HTMLDivElement, options: Accessor<ResizableOptions>) {
  let resizerRef!: HTMLDivElement;
  createComputed(() => {
    resizableRef.classList.add('resizable');
    render(() => <div ref={resizerRef} class="resizer" />, resizableRef);
  });

  let startHeight = 0;
  let startWidth = 0;
  let startX = 0;
  let startY = 0;
  let H_W_aspectRatio = 1;

  createEffect(() => {
    const styles = window.getComputedStyle(resizableRef);
    startHeight = parseInt(styles.height);
    startWidth = parseInt(styles.width);
    H_W_aspectRatio = startHeight / startWidth;
  })

  const externalResizeObserver = new ResizeObserver((entries) => {
    const { contentRect } = entries[0];
    startHeight = contentRect.height;
    startWidth = contentRect.width;
    H_W_aspectRatio = startHeight / startWidth;
  });
  externalResizeObserver.observe(resizableRef);


  const onMouseDown = (event: MouseEvent) => {
    document.body.style.cursor = 'se-resize';
    startX = event.clientX;
    startY = event.clientY;

    externalResizeObserver.unobserve(resizableRef);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }
  createComputed(() =>
    resizerRef.addEventListener("mousedown", onMouseDown)
  )

  const onMouseMove = (event: MouseEvent) => {
    let dW = event.clientX - startX;
    let dH = event.clientY - startY;
    // let dX = 0;
    // let dY = 0;

    const rotatedAngle_str = window.getComputedStyle(resizableRef).rotate;
    const rotatedAngle = parseInt(rotatedAngle_str);
    if (rotatedAngle) {
      [dW, dH] = rotateMouseMovement(dW, dH, rotatedAngle);
    }

    let height = startHeight + dH;
    let width = startWidth + dW;
    if (options()?.keepRatio && H_W_aspectRatio) {
      width = height / H_W_aspectRatio;
    }

    // if(rotatedAngle) {
    //   [dX, dY] = rotatePositionOffset(dW, dH, rotatedAngle);
    // }

    const prev_height = resizableRef.style.height;
    const prev_width = resizableRef.style.width;
    // const prev_top = resizableRef.style.top ? parseInt(resizableRef.style.top) : 0;
    // const prev_left = resizableRef.style.left ? parseInt(resizableRef.style.left) : 0;

    resizableRef.style.height = `${height}px`;
    resizableRef.style.width = `${width}px`;
    // resizableRef.style.top = `${-dY}px`;
    // resizableRef.style.left = `${dX}px`;

    const boundTo = options()?.boundTo;
    if (boundTo) {
      const boundRect = boundTo.getBoundingClientRect();
      const innerRect = resizableRef.getBoundingClientRect();

      if (passedBounds(boundRect, innerRect)) {
        resizableRef.style.height = prev_height;
        resizableRef.style.width = prev_width;
      }
    }
  }

  const onMouseUp = (_: MouseEvent) => {
    document.body.style.cursor = 'auto';
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    externalResizeObserver.observe(resizableRef);
  }

  onCleanup(() => {
    resizerRef.removeEventListener("mousedown", onMouseDown);
    externalResizeObserver.unobserve(resizableRef);
    externalResizeObserver.disconnect();
  })
}
