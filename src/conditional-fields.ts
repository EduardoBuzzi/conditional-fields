import { ConditionalField } from './classes'
import { Config } from './types'

function setupConditionalFields(config: Array<Config>) {
    if (!config || !config.length) {
        throw new Error('No configuration provided')
    }

    config.forEach(function (config) {
        new ConditionalField(config)
    })
}

if (typeof (window) !== 'undefined') {
	window.setupConditionalFields = setupConditionalFields
}