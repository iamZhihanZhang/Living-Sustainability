
// This module contains methods used for tracking input changes in fedex website.

import { LbtoKg } from "../../utils/math-utils";
import { observeAndStoreShippingOptions } from "../../popup-content";

// Observes when the different shipping option appears
export function observeFedexShippingOptions(callback) {
  console.log('OBSERVING FEDEX SHIPPING OPTIONS 💩');
  const observer = new MutationObserver((mutationsList, observer) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList") {
        const shippingOption = document.querySelector(
          ".fdx-c-definitionlist__description--small"
        );
        if (shippingOption) {
          observer.disconnect(); // Stop observing once the shipping option is found
          callback();
          break;
        }
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// Gets the new data from the fedex form
export function getFedexDataChange() {
  let currShippingOptions = [];
  const availableOptions = document.querySelectorAll(
    ".fdx-c-definitionlist__description--small"
  );
  availableOptions.forEach((option) => {
    currShippingOptions.push(option.outerText.toLowerCase().replace(/®/g, ""));
  });

  const fromAddressElement = document.getElementById("fromGoogleAddress");
  const fromAddress = fromAddressElement ? fromAddressElement.value : null;

  const toAddressElement = document.getElementById("toGoogleAddress");
  const toAddress = toAddressElement ? toAddressElement.value : null;

  const packageCountElement = document.getElementById(
    "package-details__quantity-0"
  );
  const packageCount = packageCountElement
    ? parseInt(packageCountElement.value)
    : null;

  // const packageWeightElement = document.getElementById("package-details__weight-0");
  const packageWeightElement = document.querySelector(
    "#package-details__weight-0 .fdx-c-form__input"
  );
  let packageWeight = packageWeightElement
    ? parseInt(packageWeightElement.value)
    : null;

  const unitElement = document.querySelector(
    'select[data-e2e-id="selectMeasurement"]'
  );
  const unit = unitElement ? unitElement.value : null;

  // If the unit is imperial, convert the package weight to kg.
  if (unit.includes("IMPERIAL")) {
    packageWeight = LbtoKg(packageWeight);
  }

  if (fromAddress && toAddress && packageCount && packageWeight) {
    return { fromAddress, toAddress, packageCount, packageWeight, currShippingOptions };
  }
}


// Tracks all of the changes in input field
export function recordAllInputChange() {
  // Select all input, select, and textarea elements
  const inputs = document.querySelectorAll("input, select, textarea");

  // Add event listeners to all selected elements
  inputs.forEach((input) => {
    if (
      input.id !== "package-details__package-type" &&
      input.id !== "fromGoogleAddress" &&
      input.id !== "toGoogleAddress"
    ) {
      input.addEventListener("change", handleFedexChange);
      input.addEventListener("input", handleFedexChange);
    }
  });
}

// Records the change of the package type
export function recordPackageTypeChange() {
  const packageType = document.getElementById("package-details__package-type");
  if (packageType) {
    packageType.addEventListener("change", () => {
      const packageWeightElement = document.getElementById(
        "package-details__weight-0"
      );
      const packageCountElement = document.getElementById(
        "package-details__quantity-0"
      );

      packageWeightElement.addEventListener("input", handleFedexChange);
      packageCountElement.addEventListener("input", handleFedexChange);
    });
  }
}

// Handles the change of the shipping options
export function handleFedexChange() {
  // console.log(`Changed value in ${event.target.tagName}:`, event.target.value);
  const fedexButton = document.getElementById(
    "e2ePackageDetailsSubmitButtonRates"
  );
  if (fedexButton && !fedexButton.classList.contains("lca-viz-observing")) {
    // Uses addEvent instead of addEventListener in order to ensure that we cannot add multiple event listeners
    // addEvent will not add the same function twice.
    fedexButton.addEventListener("click", () => {
      observeAndStoreShippingOptions();
    });
    fedexButton.classList.add("lca-viz-observing");
  }
}

// Records the change of the from and to address
export function recordFromToAddressChange() {
  const fromAddressElement = document.getElementById("fromGoogleAddress");
  const toAddressElement = document.getElementById("toGoogleAddress");
  // Listen to class changes on fromAddressElement and toAddressElement

  const checkBothValid = () => {
    const isFromValid = fromAddressElement.classList.contains("ng-valid");
    const isToValid = toAddressElement.classList.contains("ng-valid");
    if (isFromValid && isToValid) {
      recordAllInputChange();
      recordPackageTypeChange();
      handleFedexChange();
    }
  };

  onClassChange(fromAddressElement, checkBothValid);
  onClassChange(toAddressElement, checkBothValid);
}

// Detects if an element's class has been changed.
export function onClassChange(element, callback) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "class"
      ) {
        callback(mutation.target);
      }
    });
  });
  observer.observe(element, { attributes: true });
  return observer.disconnect;
}
