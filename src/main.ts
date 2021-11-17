import './style.css';
import { createDOMNode } from './helpers/utils';
import { onDrag } from './helpers/dnd';

const dragme = createDOMNode(
    'div',
    {
        onmousedown: onDrag,
        className: 'p-4 bg-indigo-800 text-white rounded-md shadow cursor-move',
    },
    'Click to Drag',
);

document?.querySelector('#drop-area-a')?.appendChild(dragme);
