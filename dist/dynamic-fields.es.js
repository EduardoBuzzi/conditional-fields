const styles = ".d-none{display:none!important}.dfc__animated{animation:dfc__appear .5s ease-in-out 1;transition-property:display,max-height;transition-duration:.5s;transition-behavior:allow-discrete;max-height:1000px}.dfc__animated.d-none{animation:dfc__disappear .5s ease-in-out 1;max-height:0}@keyframes dfc__appear{0%{opacity:0;max-height:0}to{opacity:1;max-height:1000px}}@keyframes dfc__disappear{0%{opacity:1;max-height:1000px;display:block!important}to{opacity:0;max-height:0;display:none!important}}";
window.setupDynamicFields = setupDynamicFields;
function setupDynamicFields(config, initialCheck = true) {
  addUtilityClasses();
  if (!config || !config.length) {
    return;
  }
  config.forEach(function(config2) {
    const trigger = document.querySelector(config2.trigger);
    const affectedBlock = config2.affected.block ? document.querySelector(config2.affected.block) : null;
    if (affectedBlock) {
      affectedBlock.classList.add("dfc__animated");
    }
    const affectedFields = config2.affected.fields.map(function(fieldConfig) {
      var _a;
      fieldConfig.element = document.querySelector(fieldConfig.selector);
      if (config2.affected.parentSelectorForFields && !fieldConfig.parentSelector) {
        fieldConfig.parentSelector = config2.affected.parentSelectorForFields;
      }
      if (!affectedBlock) {
        if (fieldConfig.parentSelector) {
          const parent = fieldConfig.parentSelector(fieldConfig.element);
          if (parent) parent.classList.add("dfc__animated");
        } else {
          (_a = fieldConfig.element) == null ? void 0 : _a.classList.add("dfc__animated");
        }
      }
      if (fieldConfig.associatedElements) {
        fieldConfig.associatedElements = fieldConfig.associatedElements.map((selector) => {
          const associatedElement = document.querySelector(selector);
          if (associatedElement) {
            associatedElement.classList.add("dfc__animated");
            return associatedElement;
          }
          return null;
        }).filter((element) => element !== null);
      }
      return fieldConfig;
    });
    if (!trigger) return;
    const eventName = config2.event ? config2.event : discoverEvent(trigger);
    if (initialCheck) checkValue(trigger == null ? void 0 : trigger.value);
    trigger.addEventListener(eventName, function(e) {
      const target = e.target;
      checkValue(target.value);
    });
    function checkValue(value) {
      if (affectedBlock) {
        if (value == config2.value) {
          affectedBlock.classList.remove("d-none");
        } else {
          affectedBlock.classList.add("d-none");
        }
      }
      affectedFields.forEach(function(fieldConfig) {
        if (!fieldConfig.element) return;
        const action = value == config2.value ? "show" : "hide";
        const maybeClearField = () => {
          if (config2.clearOnHide !== false) clearField(fieldConfig.element);
        };
        if (fieldConfig.parentSelector) {
          const parent = fieldConfig.parentSelector(fieldConfig.element);
          if (parent) {
            parent.classList[action === "show" ? "remove" : "add"]("d-none");
          }
        } else {
          fieldConfig.element.classList[action === "show" ? "remove" : "add"]("d-none");
        }
        if (action === "show") {
          if (fieldConfig.required) fieldConfig.element.required = true;
          fieldConfig.element.dataset.dfcState = "enabled";
        } else {
          if (fieldConfig.element.dataset.dfcState == "disabled") return;
          if (fieldConfig.required) fieldConfig.element.required = false;
          fieldConfig.element.dataset.dfcState = "disabled";
          maybeClearField();
        }
        if (fieldConfig.associatedElements) {
          fieldConfig.associatedElements.forEach(function(selector) {
            const element = typeof selector === "string" ? document.querySelector(selector) : selector;
            if (element) element.classList[action === "show" ? "remove" : "add"]("d-none");
          });
        }
      });
    }
  });
  function discoverEvent(trigger) {
    if (trigger.tagName === "SELECT" || trigger.tagName === "TEXTAREA") {
      return "change";
    } else if (trigger.tagName === "INPUT") {
      const type = trigger.type;
      if (type === "checkbox" || type === "radio" || type === "file") {
        return "change";
      }
    }
    return "input";
  }
  function clearField(field) {
    if (field) {
      if (field.tagName === "INPUT") {
        const type = field.getAttribute("type");
        if (type === "checkbox" || type === "radio") {
          field.checked = false;
        } else {
          field.value = "";
        }
      } else if (field.tagName === "SELECT") {
        field.selectedIndex = 0;
      } else if (field.tagName === "TEXTAREA") {
        field.innerHTML = "";
      }
    }
  }
  function addUtilityClasses() {
    if (!document.getElementById("dfc-utility-styles")) {
      const style = document.createElement("style");
      style.id = "dfc-utility-styles";
      style.innerHTML = styles;
      document.head.appendChild(style);
    }
  }
}
