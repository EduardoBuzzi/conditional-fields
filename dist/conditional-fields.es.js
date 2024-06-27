var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const styles = ".d-none{display:none!important}.dcf__animated{animation:dcf__appear .5s ease-in-out 1;transition-property:display,max-height;transition-duration:.5s;transition-behavior:allow-discrete;max-height:1000px}.dcf__animated.d-none{animation:dcf__disappear .5s ease-in-out 1;max-height:0}@keyframes dcf__appear{0%{opacity:0;max-height:0}to{opacity:1;max-height:1000px}}@keyframes dcf__disappear{0%{opacity:1;max-height:1000px;display:block!important}to{opacity:0;max-height:0;display:none!important}}";
class ConditionalField {
  constructor(triggerSelector, value, shouldBeRequired = false, clearOnHide = true, affectedFields = [], affectedBlock, parentSelector) {
    /**
     * Selector of the field elements in the DOM that will trigger the conditional field.
     */
    __publicField(this, "triggerSelector");
    /**
     * Field responsible for the conditional behavior.
     */
    __publicField(this, "trigger");
    __publicField(this, "value");
    /**
     * If the dependent field should be required when the trigger rule is met.
     */
    __publicField(this, "shouldBeRequired");
    /**
     * If the dependent field should be cleared when the trigger rule is not met.
     */
    __publicField(this, "clearOnHide");
    /**
     * Array of elements that are affected by the conditional field.
     * These elements will be affected when the trigger rule is met.
     */
    __publicField(this, "affectedFields");
    /**
     * Block that contains the fields affected by the conditional field.
     * Useful when you have a group of fields that should be hidden together.
     */
    __publicField(this, "affectedBlock");
    this.triggerSelector = triggerSelector;
    this.trigger = Field.createField(triggerSelector);
    this.shouldBeRequired = shouldBeRequired;
    this.clearOnHide = clearOnHide;
    this.value = typeof value === "string" ? [value] : value;
    this.affectedFields = affectedFields.map((affectedField) => {
      if (parentSelector && !affectedField.parentSelector) {
        affectedField.parentSelector = parentSelector;
      }
      return Field.createField(affectedField.selector, affectedField.required, affectedField.associatedElements, affectedField.parentSelector);
    }).filter((element) => element !== null);
    if (affectedBlock) {
      this.affectedBlock = document.querySelector(affectedBlock);
      this.affectedBlock.classList.add("dcf__animated");
    }
    this.initialize();
    ConditionalField.addUtilityClasses();
  }
  initialize() {
    this.trigger.addEventListener(() => {
      this.check();
    });
  }
  check(value = null) {
    let show = false;
    if (!value) {
      const values = this.trigger.getValues().filter((val) => val);
      if (values.length === 0) {
        show = false;
      } else {
        show = values.some((val) => this.value.includes(val));
      }
    } else {
      show = this.value.includes(value);
    }
    this.updateVisibility(show);
    this.updateRequired(show);
    if (!show && this.clearOnHide) {
      this.clearFields();
    }
  }
  updateVisibility(show) {
    var _a;
    if (this.affectedBlock) {
      return this.affectedBlock.classList.toggle("d-none", !show);
    }
    (_a = this.affectedFields) == null ? void 0 : _a.forEach((field) => {
      field.toggleVisibility(show);
    });
  }
  updateRequired(show) {
    var _a;
    (_a = this.affectedFields) == null ? void 0 : _a.forEach((field) => {
      field.setRequired(show && this.shouldBeRequired);
    });
  }
  clearFields() {
    var _a;
    (_a = this.affectedFields) == null ? void 0 : _a.forEach((field) => {
      if (this.clearOnHide) {
        field.clear();
      }
    });
  }
  static addUtilityClasses() {
    if (!document.getElementById("dcf-utility-styles")) {
      const style = document.createElement("style");
      style.id = "dcf-utility-styles";
      style.innerHTML = styles;
      document.head.appendChild(style);
    }
  }
}
class Field {
  /**
   * @param selector Selector of the field elements in the DOM.
   * @param required Flag to indicate if the field is required.
   */
  constructor(selector, required = false, associatedElements, parentSelector) {
    /**
     * Selector of the field elements in the DOM.
     */
    __publicField(this, "selector");
    /**
     * Array of elements that are part of the field.
     * For example, a field can have multiple radio buttons.
     */
    __publicField(this, "elements");
    /**
     * Flag to indicate if the field is required.
     */
    __publicField(this, "required");
    /**
     * Array of elements that are associated with the field.
     * For example, a field can have a label that should be hidden when the field is hidden.
     * Useful when you haven't a parent selector for the field.
     */
    __publicField(this, "associatedElements");
    /**
     * Informed function to get the parent element of the field, like a form-group div.
     * Used to show/hide the parent element when the field needs to be shown/hidden.
     * @param element Field element.
     */
    __publicField(this, "parentSelector");
    this.selector = selector;
    this.required = required;
    this.elements = this.getElements(selector);
    this.parentSelector = parentSelector;
    if (associatedElements) {
      this.associatedElements = this.getElements(associatedElements);
    }
    this.addClass(this.elements);
  }
  /**
   * Method to create a new instance of the Field class.
   * @param selector Selector of the field elements in the DOM.
   * @param required Flag to indicate if the field is required.
   * @returns Returns a new instance of the Field class.
   */
  static createField(selector, required = false, associatedElements, parentSelector) {
    let firstElement;
    if (!(firstElement = document.querySelector(selector))) {
      throw new Error(`No elements found for selector: ${selector}`);
    }
    if (firstElement.tagName === "INPUT") {
      return new InputField(selector, required, associatedElements, parentSelector);
    } else if (firstElement.tagName === "SELECT") {
      return new SelectField(selector, required, associatedElements, parentSelector);
    } else if (firstElement.tagName === "TEXTAREA") {
      return new TextareaField(selector, required, associatedElements, parentSelector);
    } else {
      return new ElementField(selector, required, associatedElements, parentSelector);
    }
  }
  getElements(selector) {
    const elements = document.querySelectorAll(
      Array.isArray(selector) ? selector.join(",") : selector
    );
    if (elements.length === 0) {
      throw new Error(`No elements found for selector: ${selector}`);
    }
    return Array.from(elements);
  }
  addClass(elements) {
    elements.forEach((element) => {
      element.classList.add("dcf__animated");
    });
    if (this.parentSelector) {
      elements.forEach((element) => {
        var _a;
        const parent = (_a = this.parentSelector) == null ? void 0 : _a.call(this, element);
        if (parent) {
          parent.classList.add("dcf__animated");
        }
      });
    }
    if (this.associatedElements) {
      this.associatedElements.forEach((element) => {
        element.classList.add("dcf__animated");
      });
    }
  }
  /**
   * Method to handle the event of the field.
   */
  addEventListener(handler, eventName = this.getEventName()) {
    if (!eventName) return;
    this.elements.forEach((element) => {
      element.addEventListener(eventName, handler);
    });
  }
  setRequired(required) {
    this.required = required;
    this.elements.forEach((element) => {
      element.required = required;
    });
  }
  toggleVisibility(show) {
    const action = show ? "remove" : "add";
    if (this.parentSelector) {
      this.elements.forEach((element) => {
        var _a;
        const parent = (_a = this.parentSelector) == null ? void 0 : _a.call(this, element);
        if (parent) {
          parent.classList[action]("d-none");
        } else {
          element.classList[action]("d-none");
        }
      });
    } else {
      this.elements.forEach((element) => {
        element.classList[action]("d-none");
      });
      if (this.associatedElements) {
        this.associatedElements.forEach((element) => {
          element.classList[action]("d-none");
        });
      }
    }
  }
}
class InputField extends Field {
  clear() {
    this.elements.forEach((element) => {
      const input = element;
      if (input.type === "checkbox" || input.type === "radio") {
        input.checked = false;
      } else {
        input.value = "";
      }
    });
  }
  getValues() {
    const values = [];
    this.elements.forEach((element) => {
      const input = element;
      if (input.type === "checkbox" || input.type === "radio") {
        if (input.checked) {
          values.push(input.value);
        }
      } else {
        values.push(input.value);
      }
    });
    return values;
  }
  getEventName() {
    const type = this.elements[0].type;
    if (type === "checkbox" || type === "radio" || type === "file") {
      return "change";
    }
    return "input";
  }
  setRequired(required) {
    if (this.elements[0].type === "checkbox") return;
    super.setRequired(required);
  }
}
class SelectField extends Field {
  clear() {
    this.elements.forEach((element) => {
      const select = element;
      select.selectedIndex = 0;
    });
  }
  getValues() {
    return this.elements.map((element) => {
      const select = element;
      return select.value;
    });
  }
  getEventName() {
    return "change";
  }
}
class TextareaField extends Field {
  clear() {
    this.elements.forEach((element) => {
      const textarea = element;
      textarea.value = "";
    });
  }
  getValues() {
    return this.elements.map((element) => {
      const textarea = element;
      return textarea.value;
    });
  }
  getEventName() {
    return "input";
  }
}
class ElementField extends Field {
  clear() {
    return;
  }
  getValues() {
    return this.elements.map((element) => {
      return element.textContent || "";
    });
  }
  getEventName() {
    return null;
  }
}
function setupConditionalFields(config, initialCheck = true) {
  if (!config || !config.length) {
    throw new Error("No configuration provided");
  }
  config.forEach(function(config2) {
    var cf = new ConditionalField(config2.trigger, config2.value, true, config2.clearOnHide, config2.affected.fields, config2.affected.block, config2.affected.parentSelector);
    if (initialCheck) cf.check();
  });
}
if (typeof window !== "undefined") {
  window.setupConditionalFields = setupConditionalFields;
}
