import { ConditionalField } from './field'
import { Config, InputElement, IField, AffectedField } from './types'
import styles from './dynamicFields.css?inline'

function setupDynamicFields(config: Array<Config>, initialCheck: boolean = true) {
    if (!config || !config.length) {
        throw new Error('No configuration provided');
    }

    addUtilityClasses()
    initialize(config)


    function initialize(config: Array<Config>) {
        config.forEach(function (config) {
            prepareConfig(config)
        })
    }

    function prepareConfig(config: Config): Config {
        const triggers: NodeListOf<InputElement> = document.querySelectorAll(config.trigger)
        const affectedBlock = config.affected.block ? document.querySelector(config.affected.block) : null
        if (affectedBlock) {
            affectedBlock.classList.add('dfc__animated')
        }
        const affectedFields: Array<IField> = config.affected.fields.map(function (fieldConfig: AffectedField) {
            return ConditionalField.createField(fieldConfig.selector, fieldConfig.required, fieldConfig.associatedElements as string[]);

            // defining the parent element for the field from global config
            // if (config.affected.parentSelectorForFields && !fieldConfig.parentSelector) {
            //     fieldConfig.parentSelector = config.affected.parentSelectorForFields as (element: HTMLElement) => HTMLElement;
            // }

            // // applying the 'dfc__animated' class to the element
            // if (!affectedBlock) {
            //     if (fieldConfig.parentSelector) {
            //         fieldConfig.elements.forEach((element) => {
            //             const parent = fieldConfig.parentSelector?.(element);
            //             if (parent) parent.classList.add('dfc__animated');
            //         });
            //     } else {
            //         fieldConfig.elements.forEach((element) => {
            //             element.classList.add('dfc__animated');
            //         });
            //     }
            // }

            // // proccessing associated elements
            // if (fieldConfig.associatedElements) {
            //     fieldConfig.associatedElements = fieldConfig.associatedElements.map(selector => {
            //         const associatedElement = document.querySelector(selector as string) as HTMLElement | null;
            //         if (associatedElement) {
            //             associatedElement.classList.add('dfc__animated');
            //             return associatedElement;
            //         }
            //         return null;
            //     }).filter(element => element !== null);
            // }

            // return fieldConfig;
        });

        if (!triggers.length) return

        const eventName = config.event ? config.event : discoverEvent(triggers[0]);

        if (initialCheck) checkValue(getTriggerValues(triggers))

        triggers.forEach(trigger => {
            trigger.addEventListener(eventName, function (e: Event) {
                checkValue(getTriggerValues(triggers))
            })
        });

        function checkValue(value: string | string[] | null) {
            
            let action = null;
            if (Array.isArray(value)) {
                action = value.includes(config.value) ? 'show' : 'hide';
            } else {
                action = config.value === value ? 'show' : 'hide';
            }

            if (affectedBlock) {
                if (action === 'show') {
                    affectedBlock.classList.remove('d-none')
                } else {
                    affectedBlock.classList.add('d-none')
                }
            }

            affectedFields.forEach(function (fieldConfig) {
                if (!fieldConfig.elements) return;

                // Função para limpar o campo se necessário
                const maybeClearField = (element: InputElement) => {
                    if (config.clearOnHide !== false) clearField(element);
                };

                // Primeiro, manipule a visibilidade
                if (fieldConfig.parentSelector) {
                    fieldConfig.elements.forEach((element) => {
                        const parent = fieldConfig.parentSelector?.(element);
                        if (parent) parent.classList[action === 'show' ? 'remove' : 'add']('d-none');
                    });
                } else {
                    if (!affectedBlock) {
                        fieldConfig.elements.forEach((element) => {
                            element.classList[action === 'show' ? 'remove' : 'add']('d-none');
                        });
                    }
                }

                // Em seguida, aplique a lógica de atributos independentemente da visibilidade
                if (action === 'show') {
                    if (fieldConfig.required) {
                        fieldConfig.elements.forEach((element) => {
                            element.required = true;
                        });
                    }
                    fieldConfig.elements.forEach((element) => {
                        element.dataset.dfcState = 'enabled';
                    });
                } else {
                    // Supondo que fieldConfig.elements é um NodeListOf<HTMLElement>
                    fieldConfig.elements.forEach((element) => {
                        if (element.dataset.dfcState == 'disabled') return;
                        if (fieldConfig.required) element.required = false;
                        element.dataset.dfcState = 'disabled';
                        maybeClearField(element); // Assumindo que maybeClearField pode aceitar um elemento como argumento
                    });
                }

                // Manipula elementos associados
                if (fieldConfig.associatedElements) {
                    fieldConfig.associatedElements.forEach(function (selector) {
                        const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
                        if (element) element.classList[action === 'show' ? 'remove' : 'add']('d-none');
                    });
                }
            });
        }

        function getTriggerValues(triggers: NodeListOf<InputElement>): string[] | string | null {
            if(triggers[0].type === 'radio' || triggers[0].type === 'checkbox') {
                let values: string[] = [];
                triggers.forEach(trigger => {
                    if ((trigger as HTMLInputElement).checked) {
                        return values.push((trigger as HTMLInputElement).value);
                    }
                });
                return values;
            }
            return triggers[0]?.value || null;
        }
    }

    function discoverEvent(trigger: InputElement) {
        if (trigger.tagName === 'SELECT' || trigger.tagName === 'TEXTAREA') {
            return 'change'
        } else if (trigger.tagName === 'INPUT') {
            const type = trigger.type
            if (type === 'checkbox' || type === 'radio' || type === 'file') {
                return 'change'
            }
        }
        return 'input'
    }

    function clearField(field: InputElement | null | undefined) {
        if (field) {
            if (field.tagName === 'INPUT') {
                const type = field.getAttribute('type')
                if (type === 'checkbox' || type === 'radio') {
                    (field as HTMLInputElement).checked = false
                } else {
                    field.value = ''
                }
            } else if (field.tagName === 'SELECT') {
                (field as HTMLSelectElement).selectedIndex = 0
            } else if (field.tagName === 'TEXTAREA') {
                field.value = ''
            }
        }
    }

    function addUtilityClasses() {
        if (!document.getElementById('dfc-utility-styles')) {
            const style = document.createElement('style');
            style.id = 'dfc-utility-styles';
            style.innerHTML = styles;
            document.head.appendChild(style);
        }
    }
}

if (typeof (window) !== 'undefined') {
	window.setupDynamicFields = setupDynamicFields;
}