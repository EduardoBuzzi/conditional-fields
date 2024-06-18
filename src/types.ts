export type Config = {
    trigger: string
    value: string
    event?: string
    affected: Affected
    clearOnHide?: boolean
}

export type Affected = {
    block?: string // block that contains the fields (optional)
    fields: Array<Field>  // fields that will be affected
    parentSelectorForFields?: (element: HTMLElement) => HTMLElement | null; // function that returns the parent element of the fields to show/hide
}

export type Field = {
    selector: string
    required?: boolean
    shouldHide?: boolean
    elements?: NodeListOf<InputElement> | null
    associatedElements?: (HTMLElement | string | null)[] // elements that should be hidden when this field is hidden
    parentSelector?: (element: HTMLElement) => HTMLElement; // function that returns the parent element of the field to show/hide
}

export type InputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement