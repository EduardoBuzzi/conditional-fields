import { Field } from "./Field"

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