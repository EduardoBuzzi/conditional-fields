import { IField, AffectedField } from './types';

export class ConditionalField{

    /**
     * Selector of the field elements in the DOM that will trigger the conditional field.
     */
    triggerSelector: string;

    /**
     * Field responsible for the conditional behavior.
     */
    trigger: Field;

    value: string | Array<string>;

    /**
     * If the dependent field should be required when the trigger rule is met.
     */
    shouldBeRequired: boolean;

    /**
     * If the dependent field should be cleared when the trigger rule is not met.
     */
    clearOnHide: boolean;
    
    /**
     * Array of elements that are affected by the conditional field.
     * These elements will be affected when the trigger rule is met.
     */
    affectedFields?: Array<Field>;

    constructor(triggerSelector: string, value: string | string[], shouldBeRequired: boolean = false, clearOnHide: boolean = true, affectedFields: AffectedField[] = []) {
        this.triggerSelector = triggerSelector;
        this.trigger = Field.createField(triggerSelector);
        this.shouldBeRequired = shouldBeRequired;
        this.clearOnHide = clearOnHide;
        this.value = typeof value === 'string' ? [value] : value;
        
        this.affectedFields = affectedFields.map(affectedField => {
            return Field.createField(affectedField.selector, affectedField.required, affectedField.associatedElements, affectedField.parentSelector);
        }).filter(element => element !== null) as Array<Field>;

        this.initialize();
    }

    private initialize() {
        this.trigger.addEventListener(this.handleEvent);
    }

    private handleEvent = (event: Event) => {
        const trigger = event.target as HTMLInputElement;
        const show = this.value.includes(trigger.value);
        this.affectedFields?.forEach(field => {
            field.toggleVisibility(show);
            field.setRequired(show && this.shouldBeRequired);
            if (!show && this.clearOnHide) {
                field.clear();
            }
        });
    }

    // toggleVisibility(show: boolean) {
    //     const action = show ? 'remove' : 'add';
    //     this.elements.forEach(element => {
    //         element.classList[action]('d-none');
    //     });
    //     this.associatedElements.forEach(element => {
    //         (element as HTMLElement).classList[action]('d-none');
    //     });
    // }

}

export abstract class Field implements IField {

    /**
     * Selector of the field elements in the DOM.
     */
    selector: string;

    /**
     * Array of elements that are part of the field.
     * For example, a field can have multiple radio buttons.
     */
    elements: Array<HTMLElement>;

    /**
     * Flag to indicate if the field is required.
     */
    required: boolean;

    /**
     * Array of elements that are associated with the field.
     * For example, a field can have a label that should be hidden when the field is hidden.
     * Useful when you haven't a parent selector for the field.
     */
    associatedElements?: Array<HTMLElement>;

    /**
     * Informed function to get the parent element of the field, like a form-group div.
     * Used to show/hide the parent element when the field needs to be shown/hidden.
     * @param element Field element.
     */
    parentSelector?: (element: HTMLElement) => HTMLElement;

    /**
     * @param selector Selector of the field elements in the DOM.
     * @param required Flag to indicate if the field is required.
     */
    constructor(selector: string, required: boolean = false, associatedElements?: string[] | null, parentSelector?: (element: HTMLElement) => HTMLElement) {
        this.selector = selector;
        this.required = required;
        this.elements = this.getElements(selector);
        this.addClass(this.elements);
        if (associatedElements) {
            this.associatedElements = this.getElements(associatedElements);
            this.addClass(this.associatedElements);
        }
        this.parentSelector = parentSelector;
    }

    /**
     * Method to create a new instance of the Field class.
     * @param selector Selector of the field elements in the DOM.
     * @param required Flag to indicate if the field is required.
     * @returns Returns a new instance of the Field class.
     */
    static createField(selector: string, required: boolean = false, associatedElements?: string[] | null, parentSelector?: (element: HTMLElement) => HTMLElement): Field {
        let firstElement: HTMLElement | null;
        if (!(firstElement = document.querySelector(selector))) {
            throw new Error(`No elements found for selector: ${selector}`);
        }

        if (firstElement.tagName === 'INPUT') {
            return new InputField(selector, required, associatedElements, parentSelector);
        } else if (firstElement.tagName === 'SELECT') {
            return new SelectField(selector, required, associatedElements, parentSelector);
        } else if (firstElement.tagName === 'TEXTAREA') {
            return new TextareaField(selector, required, associatedElements, parentSelector);
        } else {
            return new ElementField(selector, required, associatedElements, parentSelector);
        }
    }

    private getElements(selector: string | string[]): Array<HTMLElement>{
        const elements = document.querySelectorAll(
            Array.isArray(selector) ? 
            selector.join(',') : 
            selector) as NodeListOf<HTMLElement>;
        if (elements.length === 0) {
            throw new Error(`No elements found for selector: ${selector}`);
        }
        return Array.from(elements);
    }

    private addClass(elements: Array<HTMLElement>) {
        elements.forEach(element => {
            element.classList.add('dfc__animated'); // animated class is used for CSS animations
        });

        if (this.parentSelector) {
            elements.forEach(element => {
                const parent = this.parentSelector?.(element);
                if (parent) {
                    parent.classList.add('dfc__animated');
                }
            });
        }
    }

    abstract clear(): void;
    abstract getEventName(): string | null;

    /**
     * Method to handle the event of the field.
     */
    addEventListener(handler: (event: Event) => void, eventName: string | null = this.getEventName()) {

        if (!eventName) return;
        
        this.elements.forEach(element => {
            element.addEventListener(eventName, handler);
        });
    }

    setRequired(required: boolean) {
        this.required = required;
        this.elements.forEach(element => {
            (element as HTMLInputElement).required = required;
        });
    }

    toggleVisibility(show: boolean) {
        const action = show ? 'remove' : 'add';

        if (this.parentSelector) {
            this.elements.forEach(element => {
                const parent = this.parentSelector?.(element);
                if (parent) {
                    parent.classList[action]('d-none');
                }
            });
        } else {
            this.elements.forEach(element => {
                element.classList[action]('d-none');
            });
        }
    }

}

export class InputField extends Field {
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

    getEventName() {
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

    getEventName() {
        return 'input';
    }
}

/**
 * Field class for generic elements.
 * It can be used for elements like div, span, etc.
 */
export class ElementField extends Field {
    clear() {
        // there is no way to clear a generic element
        return;
    }

    getEventName() {
        // there is no way to know the event name for a generic element
        return null;
    }
}