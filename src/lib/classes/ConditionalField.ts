import { FieldFactory } from '@/lib/classes/factory/FieldFactory'
import { Field } from './Field'
import { Config, ConfigOperators } from '@/lib/utils/types'
import styles from '@/lib/styles/conditional-fields.css?inline'

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
     * Operator to be used in the conditional field.
     */
    operator: ConfigOperators

    /**
     * Value that will trigger the conditional field.
     */
    value: Array<string | number>

    /**
     * Flag to indicate if the dependent field should be hidden when trigger is empty.
     */
    hideOnEmpty: boolean

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
        this.triggerSelector = config.trigger.selector
        this.trigger = FieldFactory.createField(this.triggerSelector)
        this.value = Array.isArray(config.trigger.value) ? config.trigger.value : [config.trigger.value];
        this.operator = config.trigger.operator ?? 'equal'

        this.hideOnEmpty = config.hideOnEmpty ?? true
        this.clearOnHide = config.clearOnHide ?? true
        this.initialCheck = config.initialCheck ?? true
        
        this.affectedFields = config.affected.fields.map(affectedField => {
            if (config.affected.parentSelector && !affectedField.parentSelector) {
                affectedField.parentSelector = config.affected.parentSelector
            }
            return FieldFactory.createField(affectedField.selector, affectedField.required, affectedField.associatedElements, affectedField.parentSelector)
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
        this.initialCheck && this.check(null, false)
    }

    check(value: string | null = null, interacted: boolean = true) {
        let show = false
        const evaluateCondition = (fieldValue: string, triggerValue: string | number, operator: string) => {
            const numFieldValue = parseFloat(fieldValue);
            const numTriggerValue = typeof triggerValue === 'string' ? parseFloat(triggerValue) : triggerValue;
            switch (operator) {
                case 'equal':
                    return fieldValue === triggerValue.toString();
                case 'notEqual':
                    return fieldValue !== triggerValue.toString();
                case 'greaterThan':
                    return numFieldValue > numTriggerValue;
                case 'lessThan':
                    return numFieldValue < numTriggerValue;
                case 'greaterThanOrEqual':
                    return numFieldValue >= numTriggerValue;
                case 'lessThanOrEqual':
                    return numFieldValue <= numTriggerValue;
                case 'contains':
                    return fieldValue.includes(triggerValue.toString());
                case 'startsWith':
                    return fieldValue.startsWith(triggerValue.toString());
                case 'endsWith':
                    return fieldValue.endsWith(triggerValue.toString());
                default:
                    return fieldValue === triggerValue;
            }
        };
        
        if (!value) {
            const values = this.trigger.getValues().filter(val => val);
            if (values.length === 0) {
                show = !this.hideOnEmpty;
            } else {
                show = values.some(fieldValue => {
                    return this.value.some((triggerValue: string | number) => evaluateCondition(fieldValue, triggerValue, this.operator));
                });
            }
        } else {
            show = this.value.some((triggerValue: string | number) => evaluateCondition(value, triggerValue, this.operator));
        }
    
        this.updateVisibility(show, interacted)
        this.updateRequired(show)
        if (!show && this.clearOnHide) {
            this.clearFields()
        }
    }    

    private updateVisibility(show: boolean, interacted: boolean = true) {
        if (this.affectedBlock) {
            this.affectedBlock.dataset.dcfInteracted = interacted.toString()
            return this.affectedBlock.classList.toggle('dcf__hidden', !show)
        }

        this.affectedFields?.forEach(field => {
            field.toggleVisibility(show, interacted)
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