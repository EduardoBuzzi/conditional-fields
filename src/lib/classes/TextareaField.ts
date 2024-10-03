import { Field } from "./Field"

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