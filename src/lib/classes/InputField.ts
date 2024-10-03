import { Field } from "./Field"

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