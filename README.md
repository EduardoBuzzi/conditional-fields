# conditional-fields

A JavaScript library written in TypeScript to manage conditional fields in forms. This library allows you to show or hide form fields based on the values of other fields, improving the user experience by displaying only relevant fields.

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
      // Some additional conditional fields.
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
        selector: '#triggerField',
        value: ['option1', 'option2'],
      },
      affected: {
        fields: [
          { selector: '#field1', required: true },
          { selector: '#field2', required: false },
        ],
      },
      clearOnHide: false,
      initialCheck: false,
    });
  });
</script>
``` 

## Options

The `setupConditionalFields` function accepts an array of configuration objects, while the `ConditionalField` class accepts a single configuration object. These configurations define the behavior of each conditional field. Here are the available options:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `trigger.selector` | string |  | The CSS selector of the trigger field that controls the conditional behavior. |
| `trigger.operator` | string | equal | The operator to use for the condition. The available operators are: `equal`, `notEqual`, `greaterThan`, `lessThan`, `greaterThanOrEqual`, `lessThanOrEqual`, `contains`, `startsWith`, `endsWith`. |
| `trigger.value` | string or Array<string> |  | The value(s) of the trigger field that will activate the conditional field. |
| `affected.fields` | Array\<object\> |  | The fields that will be shown/hidden based on the trigger value. |
| `affected.block` | string | `null` | The CSS selector of a block that contains the affected fields. Useful for hiding/showing a group of fields together. |
| `affected.parentSelector` | function | `null` | A function that returns the parent element of a field, allowing for parent elements to be shown/hidden alongside the fields. |
| `hideOnEmpty` | boolean | `true` | If the affected field should be hidden when the trigger field is empty, not just when the trigger rule is met. |
| `clearOnHide` | boolean | `true` | If the dependent field should be cleared when the trigger rule is not met. |
| `initialCheck` | boolean | `true` | If the conditional field should be checked on initialization. |

## Examples

### Example 1: Basic usage with a single trigger and multiple affected fields and associated elements, such as labels.

```html
<script>
  setupConditionalFields([
    {
      trigger: {
        selector: '#has_blog',
        value: 'Yes',
      },
      affected: {
          fields: [
            {selector: '#blog_name', required: false, associatedElements: ['label[for="blog_name"]']},
            {selector: '#blog_link', required: false, associatedElements: ['label[for="blog_link"]']},
          ],
      },
      clearOnHide: false,
      initialCheck: true
    },
  ])
</script>
```

### Example 2: Using ConditionalField class with a parent selector and `hideOnEmpty`

```html
<script>
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
    hideOnEmpty: false, // do not hide affected fields when trigger value is empty
  })
</script>
```

### Example 3: Using ConditionalField class with `affected.block` to manage a group of fields

```html
<script>
  new ConditionalField({
    {
      trigger: {
        selector: '#subscriptionType',
        value: 'premium',
      },
      affected: {
        block: '#premiumOptions',
        fields: [
          {selector: '#option1', required: false},
          {selector: '#option2', required: false},
          {selector: '#option3', required: false},
        ],
      },
      clearOnHide: true,
    },
  })
</script>
```

### Example 4: using `trigger.operator`

```html
<script>
  new ConditionalField({
      trigger: {
        selector: '#age',
        operator: 'greaterThanOrEqual',
        value: 18,
      },
      affected: {
        fields: [
          {selector: '#adult_section', required: true},
        ],
        parentSelector: (element) => element.parentElement,
      },
      clearOnHide: true,
      initialCheck: true,
  })
</script>
```

## License

Open-sourced software licensed under the [MIT license](LICENSE).
