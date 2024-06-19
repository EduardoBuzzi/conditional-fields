declare global {
    interface Window { setupDynamicFields: (config: Config[], initialCheck?: boolean) => void; }
}

export type Config = {
    trigger: string
    value: string
    event?: string
    affected: Affected
    clearOnHide?: boolean
}

export type Affected = {
    block?: string // block that contains the fields (optional)
    fields: Array<AffectedField>  // fields that will be affected
    parentSelectorForFields?: (element: HTMLElement) => HTMLElement | null // function that returns the parent element of the fields to show/hide
}

export type AffectedField = {
    selector: string
    required?: boolean
    shouldHide?: boolean
    elements?: NodeListOf<InputElement> | null
    associatedElements?: (HTMLElement | string | null)[] // elements that should be hidden when this field is hidden
    parentSelector?: (element: HTMLElement) => HTMLElement // function that returns the parent element of the field to show/hide
}

export interface IField {
    elements: NodeListOf<HTMLElement>
    required: boolean
    associatedElements: Array<HTMLElement>

    clear(): void
    getEventName(): string
    setRequired(required: boolean): void
    toggleVisibility(show: boolean): void
}

export type InputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement