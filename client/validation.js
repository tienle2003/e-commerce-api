function Validator(options) {
  const selectorRules = {};

  const validate = (inputElement, rule) => {
    let errorMessage;
    const errorElement = getParentElement(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorSelector);

    const rules = selectorRules[rule.selector];

    for (let i = 0; i < rules.length; i++) {
      errorMessage = rules[i](inputElement.value);
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParentElement(inputElement, options.formGroupSelector).classList.add(
        "invalid"
      );
    } else {
      errorElement.innerText = "";
      getParentElement(
        inputElement,
        options.formGroupSelector
      ).classList.remove("invalid");
    }

    return !errorMessage;
  };

  const getParentElement = (element, selector) => {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) return element.parentElement;
      element = element.parentElement;
    }
  };

  const formElement = document.querySelector(options.form);
  if (formElement) {
    formElement.onsubmit = (e) => {
      e.preventDefault();

      let isValid = true;

      options.rules.forEach((rule) => {
        const inputElement = formElement.querySelector(rule.selector);
        const check = validate(inputElement, rule);
        if (!check) isValid = false;
      });

      if (isValid) {
        if (typeof options.onSubmit === "function") {
          const enableInputs = formElement.querySelectorAll(
            "[name]:not([disable])"
          );
          const formValues = Array.from(enableInputs).reduce(
            (values, input) => {
              values[input.name] = input.value;
              return values;
            },
            {}
          );

          options.onSubmit(formValues);
        } else {
          formElement.submit();
        }
      }
    };

    options.rules.forEach((rule) => {
      //push rule of each selector into an array
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      const inputElement = formElement.querySelector(rule.selector);
      const errorElement = getParentElement(
        inputElement,
        options.formGroupSelector
      ).querySelector(options.errorSelector);
      if (inputElement)
        //handle the event when blur is out of the input
        inputElement.onblur = () => {
          validate(inputElement, rule);
        };

      //handle the event when user key into the input
      inputElement.oninput = () => {
        errorElement.innerText = "";
        getParentElement(
          inputElement,
          options.formGroupSelector
        ).classList.remove("invalid");
      };
    });
  }
}

Validator.isRequired = (selector, message = "vui lòng nhập trường này!") => {
  return {
    selector,
    test: function (value) {
      return value.trim() ? undefined : message;
    },
  };
};

Validator.isEmail = (selector, message = "Email không hợp lệ!") => {
  return {
    selector,
    test: function (value) {
      const regex =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return regex.test(value) ? undefined : message;
    },
  };
};

Validator.minLength = (
  selector,
  min = 8,
  message = `Yêu cầu tối thiểu ${min} kí tự!`
) => {
  return {
    selector,
    test: function (value) {
      return value.length >= min ? undefined : message;
    },
  };
};

Validator.isPassword = (selector, message = "Password không hợp lệ!") => {
  return {
    selector,
    test: function (value) {
      const regex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return regex.test(value) ? undefined : message;
    },
  };
};

Validator.isConfirmed = (
  selector,
  getComfirmValue,
  message = "Giá trị nhập vào không trùng khớp!"
) => {
  return {
    selector,
    test: function (value) {
      return value === getComfirmValue() ? undefined : message;
    },
  };
};
