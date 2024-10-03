import { Field } from "./Field"

/**
 * Field class for generic elements.
 * It can be used for elements like div, span, etc.
 */
export class ElementField extends Field {
    clear() {
        return
    }

    getValues() {
        return this.elements.map(element => {
            return element.textContent || ''
        })
    }

    getEventName() {
        return null
    }
}