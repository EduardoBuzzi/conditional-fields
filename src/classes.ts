import { IField, Config, ConfigOperators } from './types'
import styles from './conditional-fields.css?inline'

export class ConditionalField {

    /**
     * Selector of the field elements in the DOM that will trigger the conditional field.
     */
    triggerSelector: string

    /**
     * Field responsible for the conditional behavior.
     */
    trigger: Field

    /**
     * Operator to be used in the conditional field.
     */
    operator: ConfigOperators

    /**
     * Value that will trigger the conditional field.
     */
    value: Array<string | number>

    /**
     * Flag to indicate if the dependent field should be hidden when trigger is empty.
     */
    hideOnEmpty: boolean

    /**
     * If the dependent field should be cleared when the trigger rule is not met.
     */
    clearOnHide: boolean
    
    /**
     * Array of elements that are affected by the conditional field.
     * These elements will be affected when the trigger rule is met.
     */
    affectedFields?: Array<Field>

    /**
     * Block that contains the fields affected by the conditional field.
     * Useful when you have a group of fields that should be hidden together.
     */
    affectedBlock?: HTMLElement | null

    /**
     * Flag to indicate if the conditional field should be checked on initialization.
     */
    initialCheck: boolean = true

    constructor(config: Config){
        this.triggerSelector = config.trigger.selector
        this.trigger = Field.createField(this.triggerSelector)
        this.value = Array.isArray(config.trigger.value) ? config.trigger.value : [config.trigger.value];
        this.operator = config.trigger.operator ?? 'equal'

        this.hideOnEmpty = config.hideOnEmpty ?? true
        this.clearOnHide = config.clearOnHide ?? true
        this.initialCheck = config.initialCheck ?? true
        
        this.affectedFields = config.affected.fields.map(affectedField => {
            if (config.affected.parentSelector && !affectedField.parentSelector) {
                affectedField.parentSelector = config.affected.parentSelector
            }
            return Field.createField(affectedField.selector, affectedField.required, affectedField.associatedElements, affectedField.parentSelector)
        }).filter(element => element !== null) as Array<Field>

        if (config.affected.block) {
            this.affectedBlock = document.querySelector(config.affected.block) as HTMLElement
            this.affectedBlock.classList.add('dcf__animated')
        }

        this.initialize()
        ConditionalField.addUtilityClasses()
    }

    private initialize() {
        this.trigger.addEventListener(() => {
            this.check()
        })
        this.initialCheck && this.check(null, false)
    }

    check(value: string | null = null, interacted: boolean = true) {
        let show = false
        const evaluateCondition = (fieldValue: string, triggerValue: string | number, operator: string) => {
            const numFieldValue = parseFloat(fieldValue);
            const numTriggerValue = typeof triggerValue === 'string' ? parseFloat(triggerValue) : triggerValue;
            switch (operator) {
                case 'equal':
                    return fieldValue === triggerValue.toString();
                case 'notEqual':
                    return fieldValue !== triggerValue.toString();
                case 'greaterThan':
                    return numFieldValue > numTriggerValue;
                case 'lessThan':
                    return numFieldValue < numTriggerValue;
                case 'greaterThanOrEqual':
                    return numFieldValue >= numTriggerValue;
                case 'lessThanOrEqual':
                    return numFieldValue <= numTriggerValue;
                case 'contains':
                    return fieldValue.includes(triggerValue.toString());
                case 'startsWith':
                    return fieldValue.startsWith(triggerValue.toString());
                case 'endsWith':
                    return fieldValue.endsWith(triggerValue.toString());
                default:
                    return fieldValue === triggerValue;
            }
        };
        
        if (!value) {
            const values = this.trigger.getValues().filter(val => val);
            if (values.length === 0) {
                show = !this.hideOnEmpty;
            } else {
                show = values.some(fieldValue => {
                    return this.value.some((triggerValue: string | number) => evaluateCondition(fieldValue, triggerValue, this.operator));
                });
            }
        } else {
            show = this.value.some((triggerValue: string | number) => evaluateCondition(value, triggerValue, this.operator));
        }
    
        this.updateVisibility(show, interacted)
        this.updateRequired(show)
        if (!show && this.clearOnHide) {
            this.clearFields()
        }
    }    

    private updateVisibility(show: boolean, interacted: boolean = true) {
        if (this.affectedBlock) {
            this.affectedBlock.dataset.dcfInteracted = interacted.toString()
            return this.affectedBlock.classList.toggle('dcf__hidden', !show)
        }

        this.affectedFields?.forEach(field => {
            field.toggleVisibility(show, interacted)
        })
    }

    private updateRequired(show: boolean) {
        this.affectedFields?.forEach(field => {
            field.setRequired(show)
        })
    }

    private clearFields() {
        this.affectedFields?.forEach(field => {
            if (this.clearOnHide) {
                field.clear()
            }
        })
    }

    static addUtilityClasses() {
        if (!document.getElementById('dcf-utility-styles')) {
            const style = document.createElement('style')
            style.id = 'dcf-utility-styles'
            style.innerHTML = styles
            document.head.appendChild(style)
        }
    }

}

export abstract class Field implements IField {

    /**
     * Selector of the field elements in the DOM.
     */
    selector: string

    /**
     * Array of elements that are part of the field.
     * For example, a field can have multiple radio buttons.
     */
    elements: Array<HTMLElement>

    /**
     * Flag to indicate if the field is required.
     */
    required: boolean

    /**
     * Array of elements that are associated with the field.
     * For example, a field can have a label that should be hidden when the field is hidden.
     * Useful when you haven't a parent selector for the field.
     */
    associatedElements?: Array<HTMLElement>

    /**
     * Informed function to get the parent element of the field, like a form-group div.
     * Used to show/hide the parent element when the field needs to be shown/hidden.
     * @param element Field element.
     */
    parentSelector?: (element: HTMLElement) => HTMLElement | null

    /**
     * @param selector Selector of the field elements in the DOM.
     * @param required Flag to indicate if the field is required.
     */
    constructor(selector: string, required: boolean = false, associatedElements?: string[] | null, parentSelector?: (element: HTMLElement) => HTMLElement | null) {
        this.selector = selector
        this.required = required
        this.elements = this.getElements(selector)
        this.parentSelector = parentSelector
        if (associatedElements) {
            this.associatedElements = this.getElements(associatedElements)
        }
        this.addClass(this.elements)
    }

    /**
     * Method to create a new instance of the Field class.
     * @param selector Selector of the field elements in the DOM.
     * @param required Flag to indicate if the field is required.
     * @returns Returns a new instance of the Field class.
     */
    static createField(selector: string, required: boolean = false, associatedElements?: string[] | null, parentSelector?: (element: HTMLElement) => HTMLElement | null): Field {
        let firstElement: HTMLElement | null
        if (!(firstElement = document.querySelector(selector))) {
            throw new Error(`No elements found for selector: ${selector}`)
        }

        if (firstElement.tagName === 'INPUT') {
            return new InputField(selector, required, associatedElements, parentSelector)
        } else if (firstElement.tagName === 'SELECT') {
            return new SelectField(selector, required, associatedElements, parentSelector)
        } else if (firstElement.tagName === 'TEXTAREA') {
            return new TextareaField(selector, required, associatedElements, parentSelector)
        } else {
            return new ElementField(selector, required, associatedElements, parentSelector)
        }
    }

    private getElements(selector: string | string[]): Array<HTMLElement>{
        const elements = document.querySelectorAll(
            Array.isArray(selector) ? 
            selector.join(',') : 
            selector) as NodeListOf<HTMLElement>
        if (elements.length === 0) {
            throw new Error(`No elements found for selector: ${selector}`)
        }
        return Array.from(elements)
    }

    private addClass(elements: Array<HTMLElement>) {
        elements.forEach(element => {
            element.classList.add('dcf__animated') // animated class is used for CSS animations
            element.dataset.dcfInteracted = 'false'
        })

        if (this.parentSelector) {
            elements.forEach(element => {
                const parent = this.parentSelector?.(element)
                if (parent) {
                    parent.classList.add('dcf__animated')
                    parent.dataset.dcfInteracted = 'false'
                }
            })
        }

        if (this.associatedElements) {
            this.associatedElements.forEach(element => {
                element.classList.add('dcf__animated')
                element.dataset.dcfInteracted = 'false'
            })
        }
    }

    abstract clear(): void
    abstract getEventName(): string | null
    abstract getValues(): string[]


    /**
     * Method to handle the event of the field.
     */
    addEventListener(handler: (event: Event) => void, eventName: string | null = this.getEventName()) {

        if (!eventName) return
        
        this.elements.forEach(element => {
            element.addEventListener(eventName, handler)
        })
    }

    setRequired(required: boolean) {
        /**
         * Prevent setting required on non-required inputs that will be hidden
         */
        if(!this.required && required) return
        this.elements.forEach(element => {
            (element as HTMLInputElement).required = required
        })
    }

    toggleVisibility(show: boolean, interacted: boolean = true) {
        const action = show ? 'remove' : 'add'

        const applyAction = (element: HTMLElement) => {
            const targetElement = this.parentSelector?.(element) || element
            targetElement.classList[action]('dcf__hidden')
            targetElement.dataset.dcfInteracted = interacted.toString()
        }

        this.elements.forEach(applyAction)
    
        if (this.associatedElements) {
            this.associatedElements.forEach(applyAction)
        }
    }

}

export class InputField extends Field {
    clear() {
        this.elements.forEach(element => {
            const input = element as HTMLInputElement
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false
            } else {
                input.value = ''
            }
            input.dispatchEvent(new Event(this.getEventName()))
        })
    }

    getValues() {
        const values: string[] = []
        this.elements.forEach(element => {
            const input = element as HTMLInputElement
            if (input.type === 'checkbox' || input.type === 'radio') {
                if (input.checked) {
                    values.push(input.value)
                }
            } else {
                values.push(input.value)
            }
        })
        return values
    }

    getEventName() {
        const type = (this.elements[0] as HTMLInputElement).type
        if (type === 'checkbox' || type === 'radio' || type === 'file') {
            return 'change'
        }
        return 'input'
    }

    setRequired(required: boolean) {
        // prevent setting required attribute on checkboxes only
        if ((this.elements[0] as HTMLInputElement).type === 'checkbox') return
        super.setRequired(required)
    }
}

export class SelectField extends Field {
    clear() {
        this.elements.forEach(element => {
            const select = element as HTMLSelectElement
            select.selectedIndex = 0
            select.dispatchEvent(new Event(this.getEventName()))
        })
    }

    getValues() {
        return this.elements.map(element => {
            const select = element as HTMLSelectElement
            return select.value
        })
    }

    getEventName(): string {
        return 'change'
    }
}

export class TextareaField extends Field {
    clear() {
        this.elements.forEach(element => {
            const textarea = element as HTMLTextAreaElement
            textarea.value = ''
            textarea.dispatchEvent(new Event(this.getEventName()))
        })
    }

    getValues() {
        return this.elements.map(element => {
            const textarea = element as HTMLTextAreaElement
            return textarea.value
        })
    }

    getEventName() {
        return 'input'
    }
}

/**
 * Field class for generic elements.
 * It can be used for elements like div, span, etc.
 */
export class ElementField extends Field {
    clear() {
        // there is no way to clear a generic element
        return
    }

    getValues() {
        return this.elements.map(element => {
            return element.textContent || ''
        })
    }

    getEventName() {
        // there is no way to know the event name for a generic element
        return null
    }
}