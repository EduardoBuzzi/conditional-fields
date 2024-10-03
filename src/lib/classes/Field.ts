import { IField } from "@/lib/utils/types"

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