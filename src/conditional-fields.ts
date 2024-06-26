import { ConditionalField } from './field'
import { Config } from './types'
import styles from './conditional-fields.css?inline'

function setupConditionalFields(config: Array<Config>, initialCheck: boolean = true) {
    if (!config || !config.length) {
        throw new Error('No configuration provided');
    }

    addUtilityClasses()
    initialize(config)


    function initialize(config: Array<Config>) {
        config.forEach(function (config) {
            var cf = new ConditionalField(config.trigger, config.value, true, config.clearOnHide, config.affected.fields, config.affected.block, config.affected.parentSelector);
            if(initialCheck) cf.check();
        })
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
	window.setupConditionalFields = setupConditionalFields;
}