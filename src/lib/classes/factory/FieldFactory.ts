import { Field } from "@/lib/classes/Field"
import { InputField } from "@/lib/classes/InputField"
import { SelectField } from "@/lib/classes/SelectField"
import { TextareaField } from "@/lib/classes/TextareaField"
import { ElementField } from "@/lib/classes/ElementField"

export class FieldFactory {
    
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
}