import { createDOMNode } from './utils';

export const dropAreaA = document.querySelector('#drop-area-a') as Element;
export const dropAreaB = document.querySelector('#drop-area-b') as Element;

const createDropShadow = () =>
    createDOMNode(
        'div',
        {
            className: 'p-4 border-2 border-dotted border-gray-800 bg-indigo-200  rounded-md text-center cursor-move',
        },
        'Drop it here',
    );

export default createDropShadow;
