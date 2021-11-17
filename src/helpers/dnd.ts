import { Mediator } from './mediator';
import createDropShadow, { dropAreaA, dropAreaB } from './shadow';
import { getAreasDistance, canDrop, px, setNodeStyle, translate3d } from './utils';

let cachedOffsetCoords: number[];
let cachedDragImage: HTMLElement;
let cachedCurrentTarget: HTMLElement;

let dropShadow: HTMLElement;
let dropArea: HTMLElement;

const reset = (mediator: Mediator) => {
    document.removeEventListener('mousemove', mediator.receive);
    document.removeEventListener('mouseup', mediator.receive);
    cachedCurrentTarget.removeEventListener('transitionend', dndReceive);
    mediator.setState('idle');
};

const defaultDragImage = (node: HTMLElement) => {
    const clone = node.cloneNode(true) as HTMLElement;
    setNodeStyle(clone, {
        willChange: 'transform',
        position: 'fixed',
        pointerEvents: 'none',
        top: 0,
        left: 0,
        opacity: 0.5,
    });
    return clone;
};

const mousemove = (evt: MouseEvent) => {
    setNodeStyle(cachedDragImage, {
        transform: translate3d(evt.clientX - cachedOffsetCoords[0], evt.clientY - cachedOffsetCoords[1]),
    });
};

const mouseup = (evt: MouseEvent) => {
    if (canDrop(dropArea, [evt.clientX, evt.clientY])) {
        dropArea.appendChild(cachedCurrentTarget);
        dropArea.removeChild(dropShadow);
    }

    const rect = cachedCurrentTarget.getBoundingClientRect();
    const dist = getAreasDistance([evt.clientX, evt.clientY], [rect.left, rect.top]);

    document.body.removeChild(cachedDragImage);
    const currentRect = cachedCurrentTarget.getBoundingClientRect();

    setNodeStyle(cachedCurrentTarget, {
        transform: translate3d(
            evt.clientX - currentRect.left - cachedOffsetCoords[0],
            evt.clientY - currentRect.top - cachedOffsetCoords[1],
        ),
        opacity: 0.5,
    });

    window.requestAnimationFrame(() => {
        setNodeStyle(cachedCurrentTarget, {
            transform: translate3d(),
            opacity: 1,
            transition: `transform ${dist * 0.5}ms ease-in-out, opacity 200ms`,
        });
    });

    cachedCurrentTarget.addEventListener('transitionend', dndReceive);
    dropArea.removeEventListener('mouseenter', dndReceive);
    dropArea.removeEventListener('mouseleave', dndReceive);

    dndMediator.setState('transitioning');
};

const mousedown = async (evt: MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();

    cachedCurrentTarget = evt.currentTarget as HTMLElement;
    const isDropAreaA = cachedCurrentTarget?.parentElement === dropAreaA;

    dropArea = isDropAreaA ? dropAreaB : dropAreaA;

    const rect = cachedCurrentTarget.getBoundingClientRect();
    const offsetX = evt.clientX - rect.left;
    const offsetY = evt.clientY - rect.top;

    cachedOffsetCoords = [offsetX, offsetY];
    cachedDragImage = defaultDragImage(cachedCurrentTarget);

    setNodeStyle(cachedDragImage, {
        transform: translate3d(rect.left, rect.top),
        width: px(rect.width),
        height: px(rect.height),
    });

    document.addEventListener('mousemove', dndReceive);
    document.addEventListener('mouseup', dndReceive);

    dropArea.addEventListener('mouseenter', dndReceive);
    dropArea.addEventListener('mouseleave', dndReceive);

    dndMediator.setState('dragging');

    await Promise.resolve();
    document.body.appendChild(cachedDragImage);
};

const mouseenter = async () => {
    dropShadow = createDropShadow() as HTMLElement;
    await Promise.resolve();
    dropArea.appendChild(dropShadow);
};

const mouseleave = async () => {
    dropArea.removeChild(dropShadow);
};

const dndMediator = new Mediator('idle', {
    idle: {
        mousedown,
    },
    dragging: {
        mousemove,
        mouseup,
        mouseenter,
        mouseleave,
    },
    transitioning: {
        transitionend() {
            reset(dndMediator);
            setNodeStyle(cachedCurrentTarget, {
                transition: 'none',
            });

            dndMediator.setState('idle');
        },
    },
});

const dndReceive = dndMediator.receive as EventListenerOrEventListenerObject;

export const onDrag = (evt: MouseEvent) => {
    dndMediator.receive(evt);
};
