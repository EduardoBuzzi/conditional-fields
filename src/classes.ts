import { IField, Config } from './types'
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
     * Value that will trigger the conditional field.
     */
    value: string | Array<string>

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
        this.triggerSelector = config.triggerSelector
        this.trigger = Field.createField(this.triggerSelector)
        this.value = typeof config.value === 'string' ? [config.value] : config.value
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
        this.initialCheck && this.check()
    }

    check(value: string | null = null) {
        let show = false
        
        if (!value) {
            const values = this.trigger.getValues().filter(val => val) // Filtra valores vazios
            if (values.length === 0) {
                show = false
            } else {
                show = values.some(val => this.value.includes(val)) // Verifica se pelo menos um valor está presente no array de valores
            }
        } else {
            show = this.value.includes(value)
        }
    
        this.updateVisibility(show)
        this.updateRequired(show)
        if (!show && this.clearOnHide) {
            this.clearFields()
        }
    }    

    private updateVisibility(show: boolean) {
        if (this.affectedBlock) {
            return this.affectedBlock.classList.toggle('dcf__hidden', !show)
        }

        this.affectedFields?.forEach(field => {
            field.toggleVisibility(show)
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
        })

        if (this.parentSelector) {
            elements.forEach(element => {
                const parent = this.parentSelector?.(element)
                if (parent) {
                    parent.classList.add('dcf__animated')
                }
            })
        }

        if (this.associatedElements) {
            this.associatedElements.forEach(element => {
                element.classList.add('dcf__animated')
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

    toggleVisibility(show: boolean) {
        const action = show ? 'remove' : 'add'

        if (this.parentSelector) {
            this.elements.forEach(element => {
                const parent = this.parentSelector?.(element)
                if (parent) {
                    parent.classList[action]('dcf__hidden')
                } else {
                    element.classList[action]('dcf__hidden')
                }
            })
        } else {
            this.elements.forEach(element => {
                element.classList[action]('dcf__hidden')
            })

            if (this.associatedElements) {
                this.associatedElements.forEach(element => {
                    element.classList[action]('dcf__hidden')
                })
            }
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