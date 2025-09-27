// popup-content.js handles the popup window that will be displayed for the following scenarios
// 1. Phone model carbon emissions
// 2. Freight carbon emissions
// 3. Cloud computing carbon emissions

import { isDomainValid } from "./utils/utils";
import { detectPhoneModel } from "./autodetect/phone/phone-utils";
import { getPhoneCarbonData } from "./autodetect/phone/phone-utils";
import { getRecommendedModels } from "./autodetect/phone/phone-utils";
import { getFedexDataChange, observeFedexShippingOptions,
  recordAllInputChange, recordPackageTypeChange, recordFromToAddressChange } from "./autodetect/freight/freight-tracker";
import { getFreightHTMLContent } from "./autodetect/freight/freight-ui";
import { getFreightData } from "./autodetect/freight/freight-utils";
import { handleCO2eEquivalencyChange, hideElement, showElement, getLCABanner } from "./utils/ui-utils";
import { getPhoneEmissionsSkeleton, displayPhoneSpecEmissions, displaySideBySideComparison } from "./autodetect/phone/phone-ui";
import { observeTextChange, observeElementTextAndClassContent, getElementByTextContent } from "./autodetect/cloud/cloud-tracker";
import { checkIsNumberInputFilled, formatInstanceNames, getCloudData } from "./autodetect/cloud/cloud-utils";
import { getCloudEmissionsSkeleton, getCloudEmissionsResult } from "./autodetect/cloud/cloud-ui";
import { loadGoogleMaps } from "./autodetect/freight/google-maps";

const lca_48 = chrome.runtime.getURL("../assets/img/lca-48.png");
// masterContainer is the main container that contains the popup content.
export let masterContainer = null;
// floatingMenu is the container that contains the floating menu.
export let floatingMenu = null;
export let shadowRoot = null;

let currentPhoneData;
let currentRecommendedPhones;

let regionText = "Waiting for input....";
let cloudSizeText = "Waiting for input....";
let isYesNoButtonClicked = false;
let durationText = 0;

const popupDomains = [
  "fedex.com",
  "azure.com",
  "amazon.com",
  "bestbuy.com",
  "apple.com",
  "store.google.com",
  "samsung.com",
  "oppo.com",
  "huawei.com",
  "lenovo.com",
];
if (isDomainValid(popupDomains)) {
  if (!window.popupInjected) {
    window.popupInjected = true; // Set global flag
    initialize();
  }
}

// This is the main method that enables all of the interaction of the autodetect feature.
// It initializes the popup content.
function initialize() {
  return new Promise((resolve) => {
    setupPopupShadowDOM();
    (async () => {
      const storedStates = await chrome.storage.sync.get("autodetect");
      const isAutoDetectEnabled = storedStates.autodetect || false;
      await loadCSS(chrome.runtime.getURL("../assets/popup-content.css"));
      if (isAutoDetectEnabled) {
        trackFreight();
        await trackPhone();
        trackCloud();
      }
      resolve();
    })();
  });
}

// Invokes popup-content.js's initialization.
export function getMasterContainer() {
  if (!window.popupInjected) {
    window.popupInjected = true;
    return initialize().then(() => {
      return masterContainer;
    });
  } else {
    return Promise.resolve(masterContainer);
  }
}

// Sets up the shadow DOM for the popup content.
export function setupPopupShadowDOM() {
  masterContainer = document.createElement("div");
  masterContainer.setAttribute("role", "main");
  masterContainer.setAttribute("tabindex", "0");
  masterContainer.classList.add("lca-viz-master-lca");
  masterContainer.classList.add("lcz-br-8");
  masterContainer.classList.add("lca-viz-hidden");
  document.body.append(masterContainer);
  const placeholder = document.createElement("div");
  placeholder.setAttribute("id", "placeholder");
  document.body.append(placeholder);
  shadowRoot = placeholder.attachShadow({ mode: "open" });
  shadowRoot.appendChild(masterContainer);
}

// Tracks the phone model and inject the popup content.
async function trackPhone() {
  const pageTitle = document.title;
  const phoneModel = detectPhoneModel(pageTitle);
  // This is the list of domains that we will check for phone model detection.
  const allowedDomains = [
    "amazon.com",
    "bestbuy.com",
    "apple.com",
    "store.google.com",
    "samsung.com",
    "oppo.com",
    "huawei.com",
    "lenovo.com",
  ];
  if (phoneModel && isDomainValid(allowedDomains)) {
    try {
      currentPhoneData = await getPhoneCarbonData(phoneModel);
      currentRecommendedPhones = await getRecommendedModels(currentPhoneData.device);
      await injectPopupContent("phone");
    } catch (error) {
      console.error(error);
    }
  }
}

// Checks if the calculate button is ready to be used
function checkCalculateButtonReady() {
  if (
    checkInputTextValid() &&
    isYesNoButtonClicked &&
    checkIsNumberInputFilled(shadowRoot)
  ) {
    shadowRoot
      .querySelector(".lca-viz-calculate-container")
      .classList.remove("disabled");
  } else {
    shadowRoot
      .querySelector(".lca-viz-calculate-container")
      .classList.add("disabled");
  }
}

// Checks if the input text is valid
function checkInputTextValid() {
  return (
    regionText !== "" &&
    cloudSizeText !== "" &&
    regionText !== "Waiting for input...." &&
    cloudSizeText !== "Waiting for input...."
  );
}



// Starts the cloud popup function
async function startCloudPopup() {
  if (regionText !== "" && cloudSizeText !== "") {
    await handleCloudPopup();
    let regionSpan = shadowRoot.getElementById("lca-viz-cloud-region-value");
    let instanceSpan = shadowRoot.getElementById("lca-viz-cloud-instance-value");
    if (regionSpan && instanceSpan) {
      regionSpan.textContent = regionText;
      instanceSpan.textContent = cloudSizeText;
      checkCalculateButtonReady();
    }
  }
}

// Checks if the cloud URL is valid
function checkCloudUrl(callback) {
  const currentHash = window.location.hash;
  if (
    currentHash === "#create/Microsoft.VirtualMachine-ARM" ||
    currentHash === "#create/Microsoft.VirtualMachine"
  ) {
    callback();
  }
}

// Tracks the cloud URL (Microsoft Azure) and injects the popup content.
function trackCloud() {
  // Check the URL on initial load and on hash changes
  const allowedDomains = ["azure.com"];
  if (isDomainValid(allowedDomains)) {
    checkCloudUrl(startObservingElements);

    window.navigation.addEventListener("navigate", () => {
      if (
        window.location.href ===
        "https://portal.azure.com/#browse/Microsoft.Compute%2FVirtualMachines"
      ) {
        startObservingElements();
      }
    });
  }
}

// Starts observing the elements for the cloud popup. If the region or size input is found, it will start the cloud popup.
async function startObservingElements() {
  observeElementTextAndClassContent("Region", ["azc-form-label"], (element) => {
    console.log("Azure: Observing region");
    setTimeout(() => {
      const regionInput =
        element?.parentElement?.parentElement?.childNodes?.[1]?.childNodes?.[0]
          ?.childNodes?.[1].childNodes?.[1];
      if (regionInput) {
        regionText = regionInput.textContent.trim();
        observeTextChange(regionInput, async (text) => {
          const size = getElementByTextContent(".azc-form-label", "Size")
            ?.parentElement?.parentElement?.childNodes?.[1]?.childNodes?.[0]
            ?.childNodes?.[1].childNodes?.[1];
          if (size) {
            cloudSizeText = size.textContent.trim();
          }
          regionText = text;
          await startCloudPopup();
        });
      }
    }, 1000);
  });

  // Observes the size input and starts the cloud popup if the size input is found.
  observeElementTextAndClassContent("Size", ["azc-form-label"], (element) => {
    console.log("Azure: Observing size");
    setTimeout(() => {
      const cloudSizeInput =
        element?.parentElement?.parentElement?.childNodes?.[1]?.childNodes?.[0]
          ?.childNodes?.[1].childNodes?.[1];
      if (cloudSizeInput) {
        cloudSizeText = cloudSizeInput.textContent.trim();
        observeTextChange(cloudSizeInput, async (text) => {
          const region = getElementByTextContent(".azc-form-label", "Region")
            ?.parentElement?.parentElement?.childNodes?.[1]?.childNodes?.[0]
            ?.childNodes?.[1].childNodes?.[1];
          if (region) {
            cloudSizeText = region.textContent.trim();
          }
          cloudSizeText = formatInstanceNames(text);
          await startCloudPopup();
        });
      }
    }, 1000);
  });
}

// Injects the cloud popup UI and handles the calculate button and yes/no button behavior
async function handleCloudPopup() {
  if (!shadowRoot.querySelector(".lca-viz-cloud-master-container")) {
    await injectPopupContent("cloud");
    handleCalculateButton(shadowRoot, regionText, cloudSizeText, durationText);
    handleYesNoButton();
  }
}

/**
 *
 * @param {HTMLElement} emissionsResultHTML The HTML content of the carbon emissions
 * @param {Boolean} isCloud Boolean indicating if this scenario is "cloud". If not, it will be for "energy"
 */
export function displayCloudEmissions(emissionsResultHTML, isCloud) {
  if (isCloud)
    shadowRoot
      .querySelector(".lca-viz-cloud-master-container")
      .classList.add("lcz-hidden-a");
  masterContainer.insertAdjacentHTML("beforeend", emissionsResultHTML);
  handleCO2eEquivalencyChange(shadowRoot);
  requestAnimationFrame(async () => {
    shadowRoot
      .querySelector(".lca-viz-cloud-emissions-container")
      .classList.remove("lcz-hidden-a");
    if (!isCloud) await hideCloudLoadingIcon();
    const cloudContent = shadowRoot.querySelector(
      ".lca-viz-cloud-results-info-container"
    );
    showElement(cloudContent, "a");
  });
}

// Handles the calculate button behavior for the cloud popup
export function handleCalculateButton() {
  const calculateBtn = shadowRoot.querySelector(".lca-viz-calculate-btn");
  const btnText = shadowRoot.querySelector(".lca-viz-calculate-btn-txt");
  let loadingInterval;

  calculateBtn.addEventListener("click", async () => {
    // Start loading animation
    let loadingState = 0;
    loadingInterval = setInterval(() => {
      loadingState = (loadingState + 1) % 4;
      btnText.textContent = "Calculating" + ".".repeat(loadingState);
    }, 500);

    try {
      const cloudData = await getCloudData(
        regionText,
        cloudSizeText,
        durationText
      );
      const data = {
        emissions: cloudData.total_co2e,
        region: regionText,
        instance: cloudSizeText,
        duration: durationText,
      };
      const emissionsResultHTML = getCloudEmissionsResult(data, "cloud");
      displayCloudEmissions(emissionsResultHTML, true);
    } finally {
      // Stop loading animation and reset button text
      clearInterval(loadingInterval);
      btnText.textContent = "Calculate";
    }
  });
}

// Handles the yes/no button behavior for the cloud popup
function handleYesNoButton() {
  let yesButton = shadowRoot.querySelector(".lca-viz-yes-button");
  let noButton = shadowRoot.querySelector(".lca-viz-no-button");
  yesButton.addEventListener("click", () => {
    noButton.classList.remove("selected");
    yesButton.classList.add("selected");
    isYesNoButtonClicked = true;
    shadowRoot
      .querySelector(".lca-viz-number-input-container")
      .classList.add("lca-viz-hidden");
    durationText = 24;
    checkCalculateButtonReady();
  });
  noButton.addEventListener("click", () => {
    yesButton.classList.remove("selected");
    noButton.classList.add("selected");
    isYesNoButtonClicked = true;
    shadowRoot
      .querySelector(".lca-viz-number-input-container")
      .classList.remove("lca-viz-hidden");
    checkCalculateButtonReady();

    const numberInput = shadowRoot.getElementById("lca-viz-number-input");
    numberInput.addEventListener("input", () => {
      durationText = numberInput.value;
      checkCalculateButtonReady();
    });
  });
}

// Fetches and injects CSS into the shadow DOM
async function loadCSS(url) {
  const response = await fetch(url);
  const cssText = await response.text();
  const style = document.createElement("style");
  style.textContent = cssText;
  shadowRoot.appendChild(style);
}

// Sets up the LCA banner and floating menu
export function setupLCABannerAndFloatingMenu() {
  const lcaBanner = getLCABanner();
  masterContainer.insertAdjacentHTML("beforeend", lcaBanner);
  const lcaFloatingMenu = getLCAPopupFloatingMenu();
  masterContainer.insertAdjacentHTML("beforebegin", lcaFloatingMenu);
  floatingMenu = shadowRoot.getElementById("lca-viz-floating-menu");
  toggleButtonState();
}

// Injects the popup content based on the popup case: phone, freight, cloud
export async function injectPopupContent(
  popupCase,
  freightData = null,
  mContainer = null,
  sRoot = null
) {
  const lcaBanner = getLCABanner();

  if (!masterContainer) masterContainer = mContainer;
  if (!shadowRoot) shadowRoot = sRoot;

  masterContainer.insertAdjacentHTML("beforeend", lcaBanner);
  const lcaFloatingMenu = getLCAPopupFloatingMenu();
  masterContainer.insertAdjacentHTML("beforebegin", lcaFloatingMenu);
  floatingMenu = shadowRoot.getElementById("lca-viz-floating-menu");
  toggleButtonState();

  if (popupCase === "phone") {
    const phoneSkeletonHTML = getPhoneEmissionsSkeleton();
    masterContainer.insertAdjacentHTML("beforeend", phoneSkeletonHTML);
    // Delay the execution of showPhoneEmissions to ensure DOM elements are available
    setTimeout(async () => {
      masterContainer.classList.remove("lca-viz-hidden");
      await showPhoneEmissions();
    }, 0);
  } else if (popupCase === "freight") {
    const freightContent = getFreightHTMLContent(freightData.formatted);
    masterContainer.insertAdjacentHTML("beforeend", freightContent);
    setTimeout(() => {
      handleCO2eEquivalencyChange(shadowRoot);
      masterContainer.classList.remove("lca-viz-hidden");
      showFreightHTMLContent();
    }, 0);
    await loadGoogleMaps(shadowRoot, freightData.originalAir, freightData.originalGround);
  } else if (popupCase === "cloud") {
    const cloudSkeletonHTML = getCloudEmissionsSkeleton(regionText, cloudSizeText);
    masterContainer.insertAdjacentHTML("beforeend", cloudSkeletonHTML);
    setTimeout(() => {
      masterContainer.classList.remove("lca-viz-hidden");
      showCloudEmissions();
    }, 0);
  }
}

// Returns the HTML code for the floating menu
function getLCAPopupFloatingMenu() {
  const floatingMenu = `
    <div class="flex-center lca-viz-floating-lca-menu pd-12 lcz-br-8 lcz-hidden-b" id="lca-viz-floating-menu">
      <img src="${lca_48}" alt="LCA Image" class="floating-lca-img lcz-icon-24">
    </div>
  `;
  return floatingMenu;
}

// Handles the behavior of opening and closing the lca-extension window.
function toggleButtonState() {
  console.log("toggle button state");
  const closeContainer = shadowRoot.querySelector(".lca-viz-close-container");
  const openContainer = shadowRoot.getElementById("lca-viz-floating-menu");
  closeContainer.addEventListener("click", () => {
    hideElement(masterContainer, "b");
    showElement(openContainer, "b");
  });
  openContainer.addEventListener("click", () => {
    hideElement(openContainer, "b");
    showElement(masterContainer, "b");
  });
}

// Hides the popup
export function hidePopup() {
  floatingMenu.remove();
}

// Shows the master container
export function showMasterContainer() {
  if (masterContainer) {
    // masterContainer should only be using hidden-b, but I'm safeguarding this in case.
    masterContainer.classList.remove("lca-viz-hidden");
    masterContainer.classList.remove("lcz-hidden-a");
    masterContainer.classList.remove("lcz-hidden-b");
    // showElement(masterContainer, "b");
    masterContainer.addEventListener("transitionend", { once: true });
  }
}

// Hides and clears the master container
export function hideAndClearMasterContainer() {
  if (masterContainer) {
    masterContainer.classList.remove("lcz-visible-b");
    masterContainer.classList.add("lcz-hidden-b");
    masterContainer.addEventListener("transitionend", clearMasterContainer, {
      once: true,
    });
  }
}

// Clears the content inside the master container
export function clearMasterContainer() {
  if (masterContainer) masterContainer.replaceChildren();
}


// Displays the UI for the phone emissions
async function showPhoneEmissions() {
  shadowRoot.querySelector(".phone-container").classList.remove("lcz-hidden-a");
  await hidePhoneLoadingIcon();
  const phoneSpecContainer = shadowRoot.querySelector(".phone-spec-container");
  const comparePhone = shadowRoot.querySelector(".compare-phone");
  showElement(phoneSpecContainer, "a");
  comparePhone.classList.remove("lcz-hidden-a");
  masterContainer.focus();
  displayPhoneSpecEmissions(currentPhoneData, shadowRoot);
  await handlePhoneCompare();
  // handlePhoneSearch();
}

// Displays the UI for the freight emissions
async function showFreightHTMLContent() {
  shadowRoot.querySelector(".freight-container").classList.remove("lcz-hidden-a");
  masterContainer.focus();
  await hideFreightLoadingIcon();
  const freightContent = shadowRoot.querySelector(".freight-content");
  showElement(freightContent, "a");
}

// Displays the UI for the cloud emissions
async function showCloudEmissions() {
  shadowRoot
    .querySelector(".lca-viz-cloud-master-container")
    .classList.remove("lcz-hidden-a");
  masterContainer.focus();
  await hideCloudLoadingIcon();
  const cloudContent = shadowRoot.querySelector(".lca-viz-cloud-info-container");
  showElement(cloudContent, "a");
}

// Updates the content of the freight UI
export async function updateFreightContent(freightData) {
  const freightContainer = shadowRoot.querySelector(".freight-container");
  const lcaBanner = shadowRoot.querySelector(".lca-banner");
  if (freightContainer) {
    lcaBanner.remove();
    freightContainer.remove();
    await injectPopupContent("freight", freightData);
  }
}

// Tracks the current web page the extension is on to see if they are 'eligible' for displaying freight emissions
function trackFreight() {
  let allowedDomains = ["fedex.com"];
  if (isDomainValid(allowedDomains)) {
    // observeFedexBtn();
    observeFedexShippingOptions(() => {
      handleFedexDataChange();
      recordAllInputChange();
      recordPackageTypeChange();
      recordFromToAddressChange();
    });
  }
}

// Observes the change of the shipping options
export function observeAndStoreShippingOptions() {
  observeFedexShippingOptions(() => {
    console.log(
      "*****************OBSERVE FEDEX SHIPPING OPTIONS*****************"
    );
    handleFedexDataChange();
  });
}

// Handles the change of the shipping options
async function handleFedexDataChange() {
  let {fromAddress, toAddress, packageCount, packageWeight, currShippingOptions} = getFedexDataChange();
  console.log("packageWeight: ", packageWeight);
  const totalWeight = packageWeight * packageCount;
  const freightData = await getFreightData(
    fromAddress,
    toAddress,
    totalWeight,
    currShippingOptions
  );
  console.log("freightData: ", freightData);
  if (shadowRoot.querySelector(".freight-container") !== null) {
    console.log("updating freight content popup.....");
    await updateFreightContent(freightData);
  } else {
    console.log("injecting freight content popup.....");
    await injectPopupContent("freight", freightData);
  }
  currShippingOptions = [];
}

// Handles the interaction of the phone comparison, including the compare and close button
async function handlePhoneCompare() {
  await populatePhoneModel();

  // For the new 2 recommended phone models
  const competitorNodeList = shadowRoot.querySelectorAll(".lca-viz-competitor-phone");
  const competitorSection = shadowRoot.querySelector(".lca-viz-competitor-section");

  competitorNodeList.forEach((phone) => {
    phone.addEventListener("click", () => {
      const phoneId = parseInt(phone.id);

      console.log("phone Id = " + phoneId);
      competitorSection.classList.add("lcz-hidden-a");
      console.log('currentPhoneData before passing on to phone-utils: ', currentPhoneData);
      displaySideBySideComparison(phoneId, currentPhoneData, currentRecommendedPhones, shadowRoot);
    });
  });
}

/**
 * Populates the phone model that can be used for side-by-side emissions comparison
 */
async function populatePhoneModel() {
  // const phoneModel = await getRecommendedModels(currentPhoneData.device);
  const phoneModel = currentRecommendedPhones;

  const phoneCompetitorContainer = shadowRoot.querySelector(
    ".lca-viz-competitor-container"
  );
  phoneCompetitorContainer.innerHTML = "";
  phoneModel.forEach((phone) => {
    const phoneElement = `
      <div class="lca-viz-competitor-phone lcz-br-8" id="${phone.index}">
        <p class="fz-16">${phone.device}</p>
      </div>
    `;
    phoneCompetitorContainer.innerHTML += phoneElement;
  });
}

// Use this function to display a loading animation while waiting for the API calls
export async function hideLoadingIcon(boxNumber = "") {
  const boxClass = boxNumber ? `lcz-loading-box-${boxNumber}` : "lcz-loading-box";
  let loadingBox = shadowRoot.querySelector(`.${boxClass}`);
  if (loadingBox) {
    return new Promise((resolve) => {
      setTimeout(() => {
        loadingBox.classList.add("lcz-hidden-a");
        resolve();
      }, 1500);
    });
  } else {
    console.error(`${boxClass} not found`);
    return Promise.resolve();
  }
}

// Export aliases for backward compatibility
export const hidePhoneLoadingIcon = () => hideLoadingIcon();
export const hideFreightLoadingIcon = () => hideLoadingIcon("2");
export const hideCloudLoadingIcon = () => hideLoadingIcon("3");