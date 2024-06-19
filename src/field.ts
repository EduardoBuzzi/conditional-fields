import { IField } from './types';

export abstract class ConditionalField implements IField{
    elements: NodeListOf<HTMLElement>;
    required: boolean;
    associatedElements: Array<HTMLElement>;

    constructor(selector: string, required: boolean = false, associatedSelectors: string[] = []) {
        this.elements = document.querySelectorAll(selector);
        this.required = required;
        this.associatedElements = associatedSelectors.map(selector => {
            return document.querySelector(selector);
        }).filter(element => element !== null) as Array<HTMLElement>;
        this.addClass(this.elements);
        this.addClass(this.associatedElements);
    }

    private addClass(elements: NodeListOf<HTMLElement> | Array<HTMLElement>) {
        elements.forEach(element => {
            element.classList.add('dfc__animated');
        });
    }

    static createField(selector: string, required: boolean = false, associatedSelectors: string[] = []): IField {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
            throw new Error(`No elements found for selector: ${selector}`);
        }

        const firstElement = elements[0];

        if (firstElement.tagName === 'INPUT') {
            return new InputField(selector, required, associatedSelectors);
        } else if (firstElement.tagName === 'SELECT') {
            return new SelectField(selector, required, associatedSelectors);
        } else if (firstElement.tagName === 'TEXTAREA') {
            return new TextareaField(selector, required, associatedSelectors);
        } else {
            throw new Error(`Unsupported field type for selector: ${selector}`);
        }
    }

    abstract clear(): void;
    abstract getEventName(): string;

    setRequired(required: boolean): void {
        this.required = required;
        this.elements.forEach(element => {
            (element as HTMLInputElement).required = required;
        });
    }

    toggleVisibility(show: boolean) {
        const action = show ? 'remove' : 'add';
        this.elements.forEach(element => {
            element.classList[action]('d-none');
        });
        this.associatedElements.forEach(element => {
            (element as HTMLElement).classList[action]('d-none');
        });
    }

}

export class InputField extends ConditionalField {
    clear() {
        this.elements.forEach(element => {
            const input = element as HTMLInputElement;
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });
    }

    getEventName(): string {
        const type = (this.elements[0] as HTMLInputElement).type;
        if (type === 'checkbox' || type === 'radio' || type === 'file') {
            return 'change';
        }
        return 'input';
    }

    setRequired(required: boolean) {
        // prevent setting required attribute on checkboxes only
        if ((this.elements[0] as HTMLInputElement).type === 'checkbox') return;
        super.setRequired(required);
    }
}

export class SelectField extends Field {
    clear() {
        this.elements.forEach(element => {
            const select = element as HTMLSelectElement;
            select.selectedIndex = 0;
        });
    }

    getEventName(): string {
        return 'change';
    }
}

export class TextareaField extends Field {
    clear() {
        this.elements.forEach(element => {
            const textarea = element as HTMLTextAreaElement;
            textarea.value = '';
        });
    }

    getEventName(): string {
        return 'input';
    }
}