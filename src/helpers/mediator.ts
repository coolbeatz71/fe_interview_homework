import { IUnknownObject } from './../interfaces';

export class Mediator {
    #state;
    description;

    constructor(entryStateValue: string, description: IUnknownObject) {
        this.#state = entryStateValue;
        this.description = description;

        // so that we can call mediator.receive as a standalone function
        this.receive = this.receive.bind(this);
    }

    setState = (value: string) => {
        this.#state = value;
    };

    receive = (event: MouseEvent) => {
        this.description[this.#state]?.[event.type]?.(event);
    };
}
