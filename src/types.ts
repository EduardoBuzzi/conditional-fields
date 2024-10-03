import { ConditionalField } from "./classes";

declare global {
    interface Window { 
        setupConditionalFields: (config: Config[]) => void;
        ConditionalField: new (config: Config) => ConditionalField;
    }
}

export type Config = {
    trigger: {
        selector: string
        operator: ConfigOperators
        value: string | string[] | number | number[]
    }
    affected: Affected
    hideOnEmpty?: boolean
    clearOnHide?: boolean
    initialCheck?: boolean
}

export type ConfigOperators = 
    | 'equal' 
    | 'notEqual' 
    | 'greaterThan' 
    | 'lessThan' 
    | 'greaterThanOrEqual' 
    | 'lessThanOrEqual' 
    | 'contains' 
    | 'startsWith' 
    | 'endsWith';

export type Affected = {
    block?: string // block that contains the fields (optional)
    fields: Array<AffectedField>  // fields that will be affected
    parentSelector?: (element: HTMLElement) => HTMLElement | null // function that returns the parent element of the fields to show/hide
}

export type AffectedField = {
    selector: string
    required?: boolean
    shouldHide?: boolean
    elements?: NodeListOf<InputElement> | null
    associatedElements?: string[] | null // elements that should be hidden when this field is hidden
    parentSelector?: (element: HTMLElement) => HTMLElement | null // function that returns the parent element of the field to show/hide
}

export interface IField {
    selector: string
    elements: Array<HTMLElement>
    required: boolean

    clear(): void
    getEventName(): string | null
    setRequired(required: boolean): void
    toggleVisibility(show: boolean): void
    getValues(): string[]
}

export type InputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement