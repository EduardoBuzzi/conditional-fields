# conditional-fields

A TypeScript library to manage conditional fields in forms. This library allows you to show or hide form fields based on the values of other fields, improving the user experience by displaying only relevant fields.

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [Options](#options)
- [Examples](#examples)
- [License](#license)

## Installation

Initially, you can download the file located at '[dist/conditional-fields.umd.js](dist/conditional-fields.umd.js)' and import it into your page like this:
```html
<script src="/path/to/conditional-fields.umd.js"></script>
```
Or you can simply copy the file contents and place them inside a script tag:
```html
<script type="text/javascript">
//... paste here
</script>
```
The library will be available in the global window context as `setupConditionalFields` and `ConditionalField`.

## Usage

You can initialize the conditional fields in two ways: using the `setupConditionalFields` function or the `ConditionalField` class.

### Using function

Using the function, you can set multiple conditional fields at a time:

```html
<script type="text/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    window.setupConditionalFields([
      {
        trigger: {
          selector: '#triggerField',
          value: 'show',
        },
        affected: {
          fields: [
            { selector: '#dependentField1', required: true },
            { selector: '#dependentField2', required: false }
          ],
        },
      },
      // some conditional fields
    ]);
  });
</script>
```

### Using class

```html
<script type="text/javascript">
  document.addEventListener('DOMContentLoaded', () => {
    new ConditionalField({
      trigger: {
        selector: '#payment_method',
        value: ['PayPal', 'Credit Card', 'Bank Transfer'],
      },
      affected: {
          fields: [
            {selector: '#comments', required: true},
          ],
          parentSelector: (element) => element.parentElement,
      },
    })
  });
</script>

``` 

## Options

The `setupConditionalFields` function accepts an array of configuration objects to define the behavior of each conditional field. Here are the available options:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| triggerSelector | string |  | The CSS selector of the trigger field that controls the conditional behavior. |
| value | string or Array<string> |  | The value(s) of the trigger field that will activate the conditional field. |
| clearOnHide | boolean | `true` | If the dependent field should be cleared when the trigger rule is not met. |
| affected | object |  | The fields and/or block that will be affected by the conditional behavior. |
| affected.fields | Array<object> |  | The fields that will be shown/hidden based on the trigger value. |
| affected.block | string | `null` | The CSS selector of a block that contains the affected fields. Useful for hiding/showing a group of fields together. |
| initialCheck | boolean | `true` | If the conditional field should be checked on initialization. |




