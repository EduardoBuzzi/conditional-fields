import { ConditionalField } from './field'
import { Config } from './types'

function setupConditionalFields(config: Array<Config>, initialCheck: boolean = true) {
    if (!config || !config.length) {
        throw new Error('No configuration provided')
    }

    config.forEach(function (config) {
        var cf = new ConditionalField(config.trigger, config.value, true, config.clearOnHide, config.affected.fields, config.affected.block, config.affected.parentSelector)
        if(initialCheck) cf.check()
    })
}

if (typeof (window) !== 'undefined') {
	window.setupConditionalFields = setupConditionalFields
}