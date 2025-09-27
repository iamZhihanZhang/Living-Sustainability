/* eslint-disable no-unused-vars */
// content.js handles the following scenario:
// 1. Displaying carbon chart on raw materials

import Chart from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
const lca_48 = chrome.runtime.getURL("../assets/img/lca-48.png");
const off_lca_btn = chrome.runtime.getURL("../assets/img/off-lca-btn.png");
const loading_icon_2 = chrome.runtime.getURL(
  "../assets/img/loading-icon-2.gif"
);
const close_icon_red = chrome.runtime.getURL(
  "../assets/img/close-icon-red.png"
);
const question_icon = chrome.runtime.getURL("../assets/img/question-icon.png");
export const expand_icon_wide = chrome.runtime.getURL(
  "../assets/img/expand-icon-wide.png"
);
const collapse_icon_wide = chrome.runtime.getURL(
  "../assets/img/collapse-icon-wide.png"
);
export const lca_32 = chrome.runtime.getURL("../assets/img/lca-32.png");

import { convertToWatts, getTotalEmissionsHTML, updateTotalEmissions } from "./material-utils";
import { convertToSeconds } from "./material-utils";
import { findByIndex } from "./material-utils";
import { createRatioSection } from "./material-utils";
import { getParam } from "./material-utils";
import { extractEmissionsFactor } from "./material-utils";
import { getQuestionLCA } from "./material-utils";
import {
  hideAndClearMasterContainer,
  hidePopup,
  setupLCABannerAndFloatingMenu,
  shadowRoot
} from "./popup-content";
import { getFreightData } from "./autodetect/freight/freight-utils";
import { handleCO2eEquivalencyChange } from "./utils/ui-utils";
import { injectPopupContent } from "./popup-content";
import { updateFreightContent } from "./popup-content";
import { getMasterContainer } from "./popup-content";
import { displayCloudEmissions } from "./popup-content";
import { showMasterContainer } from "./popup-content";
import { formatToSignificantFigures, getBeefInfo, getReadableCO2e } from "./utils/math-utils";
import { getCloudEmissionsResult } from "./autodetect/cloud/cloud-ui";
import { handleUpDownBtnBehavior, handleToggleSwitch } from "./highlight/highlight-tracker";
import { escapeRegExp, replaceTagNameAndKeepStyles, getMaterialNames, getExplanation, getValidSentence, isNotEmptyString, getChartConfig, validateText } from "./highlight/highlight-utils";
import { getLCAActionBtn, getInteractiveChartHTML, createUpDownBtn } from "./highlight/highlight-ui";
import { isDomainValid } from "./utils/utils";

let chart;
let chartContainer;
let currentChartData;
let selectionTimeout;
let LCAActionBtnContainer;

let mouseX;
let mouseY;
// Get the scroll offsets
let scrollX;
let scrollY;

let chartPosX, chartScrollX, chartPosY, chartScrollY;

let highlightTimeout;

// Global variable to keep track of the previously highlighted node
let previousHighlightedNode = null;
// currentHighlightedNode is only used with raw material scenario to keep track of the edited sentences.
let currentHighlightedNode = null;

let isAssistantActive = false;
let isPopupActive = false;

// The current scenario, either "freight" or "energy"
let currScenario = null;

// The 5 global variables below are used to store data for the energy scenario (which is used to update the energy data).
let wattage = 0;
let energyEFactor = 0;
let emissionsPerKwh = 0;
let durationEVal;
let durationEUnit;

let globalSelectionData = {
  parentNode: null, // Will store a Node
  range: null, // Will store a Range
  selection: null, // Will store a Selection
};

let relatedMaterialHTML = ``;
let independentMaterialHTML = ``;
let processesHTML = ``;

const LCA_PY_SERVER_URL = process.env.LCA_PY_SERVER_URL || "https://lca-py-server.fly.dev";

let rawMatExplanation = "";
let energyExplanation = "";

Chart.register(ChartDataLabels);

let isBrushEnabled = false;
let masterQContainer;
let floatingQMenu;
let shadowQRoot;

// Keeps track of the original value for the time and its unit for energy scenario.
let eTimeString;
let eTimeUnitString;

// Loads the resources when the page is loaded
window.onload = async () => {
  const createLinkElement = (rel, href, crossorigin) => {
    let link = document.createElement("link");
    link.rel = rel;
    link.href = href;
    if (crossorigin) {
      link.crossOrigin = crossorigin;
    }
    document.head.appendChild(link);
  };

  // TODO: Only load in the CSS if the url is valid
  // const allowedDomains = ["nature.com", "acm.org", "arxiv.org", "acs.org", "wiley.com", "fedex.com", "azure.com", "fly.dev"];
  // const allowedDomains2 = ["amazon.com", "bestbuy.com", "apple.com", "store.google.com", "samsung.com", "oppo.com", "huawei.com", "lenovo.com"];
  // if (isDomainValid(allowedDomains) || isDomainValid(allowedDomains2)) {
  const blackListedDomains = ["chatgpt.com", "youtube.com"];
  if (!isDomainValid(blackListedDomains)) {
    let fontRegular = new FontFace(
      "Lexend",
      `url(${chrome.runtime.getURL("assets/fonts/lexend-regular.woff")})`,
      {
        weight: "400",
      }
    );
    let fontBold = new FontFace(
      "Lexend",
      `url(${chrome.runtime.getURL("assets/fonts/lexend-bold.woff")})`,
      {
        weight: "700",
      }
    );
    document.fonts.add(fontRegular);
    document.fonts.add(fontBold);
    fontRegular.load();
    fontBold.load();

    createLinkElement(
      "stylesheet",
      chrome.runtime.getURL("assets/content-style.css")
    );
    createLinkElement(
      "stylesheet",
      chrome.runtime.getURL("assets/popup-content.css")
    );

    const blackList = [
      "azure.com",
      "fedex.com",
      "amazon.com",
      "bestbuy.com",
      "apple.com",
      "store.google.com",
      "samsung.com",
      "oppo.com",
      "huawei.com",
      "lenovo.com",
    ];
    if (!isDomainValid(blackList)) {
      console.log("domain NOT in blacklist");
      await init();
    } else {
      console.log("domain in blacklist");
    }
  }
};

// Initializes the shadow root and injects the CSS into the shadow DOM
async function init() {
  // * Shadow root creation process
  masterQContainer = document.createElement("div");
  masterQContainer.setAttribute("role", "main");
  masterQContainer.setAttribute("id", "lca-viz-question-container");
  masterQContainer.classList.add("lexend", "lcz-br-8", "fz-16");
  masterQContainer.setAttribute("tabindex", "0");
  document.body.append(masterQContainer);
  const placeholder = document.createElement("div");
  placeholder.setAttribute("id", "placeholder-2");
  document.body.append(placeholder);
  shadowQRoot = placeholder.attachShadow({ mode: "open" });
  shadowQRoot.appendChild(masterQContainer);

  await injectCSSToShadowDOM(
    chrome.runtime.getURL("../assets/content-style.css")
  );
  await injectCSSToShadowDOM(
    chrome.runtime.getURL("../assets/popup-content.css")
  );

  // Function to fetch and inject CSS into the shadow DOM
  async function injectCSSToShadowDOM(url) {
    const response = await fetch(url);
    const cssText = await response.text();
    const style = document.createElement("style");
    style.textContent = cssText;
    shadowQRoot.appendChild(style);
  }

  // Gets the stored states from the sync storage
  const storedStates = await chrome.storage.sync.get("brush");
  isBrushEnabled = storedStates.brush || false;
  if (isBrushEnabled) {
    // trackRawMaterial();
    trackAllScenario();
  }

  /**
   * Calculates the coordinates of an HTML element relative to the entire document.
   * @param {Element} element The target HTML element
   * @returns {Object} An object containing the `x` and `y` coordinates.
   */
  function getElementCoordinates(element) {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
    };
  }

  // Allows the user to drag the map/chart
  function handleDraggableMap() {
    const map = document.getElementById("lca-viz-map");
    map.addEventListener("mousedown", (e) => {
      console.log("detected mousedown");
      let shiftX = e.clientX - map.getBoundingClientRect().left;
      let shiftY = e.clientY - map.getBoundingClientRect().top;

      function moveAt(clientX, clientY) {
        map.style.left = clientX - shiftX + scrollX + "px";
        map.style.top = clientY - shiftY + scrollY + "px";
      }

      function onMouseMove(e) {
        moveAt(e.clientX, e.clientY);
      }

      function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);

      // Prevent the default drag and drop behavior
      map.ondragstart = () => {
        return false;
      };
    });
  }

  /**
   * Makes the highlighted text background color turn green, and displays carbon information based on scenarios
   * that is returned from the JSON (scenarios can either be: raw material, freight, or energy)
   * @param {Node} parentNode The parent node
   * @param {Range} range The range of the selected text
   * @param {Selection} selection The selected text
   */
  async function makeHighlightTextInteractive(parentNode, range, selection) {
    if (selection.toString() !== "" && selection.toString().length > 2) {
      // Visually reset the previous highlighted node if it exists
      // * For raw materials
      if (currentHighlightedNode) {
        // Store the current highlighted node as the previous highlighted node
        previousHighlightedNode = currentHighlightedNode;
        previousHighlightedNode.removeEventListener("click", redisplayChart);
        resetHighlight(currentHighlightedNode);
      }
      // * Removing the assistant / question UI
      if (isAssistantActive) {
        removeQuestionUI();
        hideAndClearMasterContainer();
      }
      // * Removing the popup UI
      if (isPopupActive) {
        hidePopup();
        hideAndClearMasterContainer();
      }
      const materialData = await getValidSentence(selection.toString());
      // * Case: raw materials
      if (materialData.raw_materials) {
        handleRawMaterialHighlight(materialData, parentNode, range, selection);
        // * Case: freight
      } else if (materialData.transport_phase) {
        currentHighlightedNode = null;
        handleFreightHighlight(materialData, parentNode, range, selection, selection.toString());
        // * Case: energy
      } else if (materialData.use_phase) {
        currentHighlightedNode = null;
        handleEnergyHighlight(materialData, parentNode, range, selection, selection.toString());
      } else {
        currentHighlightedNode = null;
        setLCAActionBtnState("error");
      }
    }
  }

  /**
   * Handles the behavior of highlighting a sentence that classifies as a "raw material" scenario
   */
  function handleRawMaterialHighlight(materialData, parentNode, range, selection){
    const materialList = materialData;
    const { rawMaterialNames, processesNames } = getMaterialNames(materialList);
    rawMatExplanation = getExplanation(materialList);
    addHighlightBold(rawMaterialNames, parentNode, range, selection);
    hideLCAActionBtn();
    initializeChart(materialData);
  }

  /**
   * Performs the action of adding a green highlight and a green bold text onto the highlighted sentence
   */
  function addHighlightBold(nameList, parentNode, range, selection, isEnergy = false) {
    const fullText = parentNode.textContent;
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;
    const startContainerText = range.startContainer.textContent;
    const endContainerText = range.endContainer.textContent;

    // Extract the segments of the text
    const beforeText = fullText.slice(0, fullText.indexOf(startContainerText) + startOffset);
    const highlightedText = selection.toString();
    const afterText = fullText.slice(fullText.indexOf(endContainerText) + endOffset);

    const div = document.createElement("div");
    div.classList.add("lca-viz-inline");

    let modifiedText = `<div class="lca-viz-mark lca-viz-inline">${highlightedText}</div>`;

    nameList.forEach((name) => {
      const escapedName = escapeRegExp(name);
      const regex = new RegExp(`\\b${escapedName}\\b`, "gi");
      if (isEnergy) {
        modifiedText = modifiedText.replace(regex,`<span class="lca-viz-param-bold lcz-editable-param"><b>${name}</b></span>`);
      } else {
        modifiedText = modifiedText.replace(regex,`<span class="lca-viz-param-bold"><b>${name}</b></span>`);
      }
    })

    modifiedText = modifiedText +
      `<div class="lca-viz-inline" id="lca-viz-end">
        <img src="${off_lca_btn}" alt="Turn off the LCA visualizer" class="lcz-icon-10 off-lca-btn lca-viz-hidden">
      </div>`;
    div.innerHTML = modifiedText;

    currentHighlightedNode = div;
    const newClasses = ["lca-viz-highlight-container"];
    const newParentNode = replaceTagNameAndKeepStyles(parentNode, "div", newClasses);
    parentNode.parentNode.replaceChild(newParentNode, parentNode);
    parentNode = newParentNode;
    parentNode.innerHTML = "";
    if (beforeText) {
      parentNode.appendChild(document.createTextNode(beforeText));
    }
    parentNode.appendChild(div);
    if (afterText) {
      parentNode.appendChild(document.createTextNode(afterText));
    }
    // If the user clicks on the red 'off-lca-btn', the highlighted text will be removed entirely.
    const offLcaBtn = document.querySelector(".off-lca-btn");
    offLcaBtn.addEventListener("click", () => {
      currentHighlightedNode.removeEventListener("click", redisplayChart);
      resetHighlight(currentHighlightedNode);
      currentHighlightedNode = null;
    });
  }


  // Handles the behavior of highlighting a sentence that classifies as an "energy" scenario
  function handleEnergyHighlight(data, parentNode, range, selection, textSource) {
    const energyData = data.use_phase;
    const processData = energyData.processes[0];
    energyExplanation = energyData.notes;
    const isDeviceExist = processData.device;
    let inputMapping;
    if (isDeviceExist) {
      inputMapping = {
        device: "lca-input-from",
        location: "lca-input-to",
      };
    } else {
      inputMapping = {
        name: "lca-input-from",
        location: "lca-input-to",
      };
    }
    const energyHTML = getQuestionLCA(
      "We've detected an energy-consuming process.",
      textSource,
      "energy",
      isDeviceExist
    );
    currScenario = "energy";
    wattage = processData.power;
    energyEFactor = processData.carbon_emission_factor;
    setupQuestionLCA(energyHTML);

    let nameList = [];
    if (processData.device) nameList.push(processData.device);
    if (processData.power_original) nameList.push(processData.power_original + " " + processData.power_original_unit);
    if (processData.time_original) {
      nameList.push(processData.time_original + " " + processData.time_original_unit);
      eTimeString = processData.time_original;
      eTimeUnitString = processData.time_original_unit;
    }
    addHighlightBold(nameList, parentNode, range, selection, true);

    autoFillInput(processData, inputMapping);
    // Autofills duration
    if (processData.time_original) {
      let time = processData.time_original;
      let unit = processData.time_original_unit;
      const timeInput = shadowQRoot.getElementById("lca-input-package-weight");
      const unitSelect = shadowQRoot.getElementById("lca-input-package-unit");
      if (time) {
        timeInput.value = time;
        checkAllValid();
      }
      if (unit) {
        if (unit === "second" || unit === "seconds") unit = "s";
        if (unit === "minute" || unit === "minutes") unit = "min";
        if (unit === "hours" || unit === "hour" || unit === "hr") unit = "h";
        unitSelect.value = unit;
        checkAllValid();
      }
    }
    showMasterQContainer();
  }

  /**
   * Handles the behavior of highlighting a sentence that classifies as a "freight" scenario
   * @param {JSON} data The data of the freight in JSON.
   * @param {String} textSource The text of the highlighted sentence.
   */
  function handleFreightHighlight(data, parentNode, range, selection, textSource) {
    const freightData = data.transport_phase;
    const freightHTML = getQuestionLCA("Looks like you plan to transport something.", textSource, "freight");

    currScenario = "freight";
    setupQuestionLCA(freightHTML);

    // Fill in the form using freightData's data.
    const transportData = freightData.transports[0];
    const inputMapping = {
      from_location: "lca-input-from",
      to_location: "lca-input-to",
    };

    addHighlightBold([], parentNode, range, selection);

    autoFillInput(transportData, inputMapping);
    // Autofills package weight and unit
    if (transportData.weight) {
      let { value, unit } = transportData.weight;
      const weightInput = shadowQRoot.getElementById(
        "lca-input-package-weight"
      );
      const unitSelect = shadowQRoot.getElementById("lca-input-package-unit");
      if (value) {
        weightInput.value = value;
        checkAllValid();
      }
      if (unit) {
        if (unit === "lb") unit = "lbs";
        unitSelect.value = unit;
        checkAllValid();
      }
    }
    showMasterQContainer();
  }

  /**
   * Takes in the JSON data and fills in the value of the input form if there is info. from the JSON data.
   * @param {JSON} data The 'transport' or 'processes' data
   * @param {Object} inputMapping The object containing the following information:
   * format = <val1> : <val2>
   *    val1 = the fields that is from JSON data
   *    val2 = the id of the corresponding html input
   */
  function autoFillInput(data, inputMapping) {
    for (const [key, inputId] of Object.entries(inputMapping)) {
      const input = shadowQRoot.getElementById(inputId);
      if (data[key]) {
        input.value = data[key];
        checkAllValid();
      }
    }
  }

  /**
   * Creates and injects the HTML for question UI and sets up all of the interactions and listeners.
   * @param {HTMLElement} contentHTML The HTML code of the content. This is either the UI for freight or energy.
   * @param {String} scenario Either "energy" or "freight".
   */
  function setupQuestionLCA(contentHTML) {
    const questionMenuHTML = getLCAContentFloatingMenu();
    // Initialize and inject the freight question UI.
    masterQContainer.insertAdjacentHTML("beforeend", contentHTML);
    masterQContainer.insertAdjacentHTML("beforebegin", questionMenuHTML);
    floatingQMenu = shadowQRoot.getElementById("lca-viz-question-menu");
    toggleQuestionButtonState();
    isAssistantActive = true;
    setTimeout(() => {
      handleQuestionForm();
    }, 0);
    hideLCAActionBtn();
  }

  /**
   * Gets the LCA Floating Menu.
   * @returns The LCA Floating Menu HTML.
   */
  function getLCAContentFloatingMenu() {
    const floatingMenu = `
      <div class="flex-center lca-viz-floating-lca-menu pd-12 lcz-br-8 lcz-hidden-b" id="lca-viz-question-menu">
        <img src="${lca_48}" alt="LCA Image" class="floating-lca-img lcz-icon-24">
      </div>
    `;
    return floatingMenu;
  }

  /**
   * Initializes the chart and displays it on the map.
   * @param {JSON} rawMaterialData The data of the raw material in JSON.
   */
  function initializeChart(rawMaterialData) {
    currentChartData = rawMaterialData;
    let chartConfig = getChartConfig(currentChartData);
    // Remove the previous chart, reset the 'chart' global variable
    const map = document.getElementById("lca-viz-map");
    if (map) {
      map.remove();
      map.innerHTML = ``;
      chart.destroy();
      chart = null;
    }
    createChart(chartConfig);
    const resetChartPosition = true;
    makeChartVisible(resetChartPosition);
  }

  /**
   * Hides the LCA Action Button and restores it to "default" stage.
   */
  function hideLCAActionBtn() {
    setLCAActionBtnState("default");
    if (LCAActionBtnContainer) {
      LCAActionBtnContainer.style.opacity = "0";
      LCAActionBtnContainer.style.visibility = "hidden";
    }
  }

  /**
   * Shows the LCA Action Button and sets it to "default" stage.
   */
  function showLCAActionBtn() {
    setLCAActionBtnState("default");
    if (LCAActionBtnContainer) {
      console.log("SHOWING LCA ACTION BTN: ");
      console.log(LCAActionBtnContainer);
      LCAActionBtnContainer.style.opacity = "1";
      LCAActionBtnContainer.style.visibility = "visible";
    }
  }

  /**
   * Resets the styling and properties of the current highlighted node.
   * @param {Node} currentNode The currently highlighted node
   */
  function resetHighlight(currentNode) {
    if (currentNode) {
      if (chart) {
        hideChart();
      }
      currentNode.classList.remove("lca-viz-inline", "lca-viz-highlight");
      currentNode
        .querySelectorAll(".lca-viz-origin-number")
        .forEach((numberNode) => {
          numberNode.classList.remove("lca-viz-hidden");
        });
      const mark = currentNode.querySelector("mark");
      if (mark) {
        mark.classList.remove("lca-viz-mark");
      }

      // Restore the text back to its original format
      const originalText = mark ? mark.textContent : currentNode.textContent;
      currentNode.parentNode.replaceChild(
        document.createTextNode(originalText),
        currentNode
      );
    }
  }

  // Enables the highlight text behavior for all scenarios: raw materials, freight, energy
  function trackAllScenario() {
    handleLCAActionBtn();
    recordCurrentMouseCoord();
    handleHighlightText();
  }

  /**
   * Handles the behavior of highlighting text when the user clicks on the text.
   */
  function handleHighlightText() {
    document.addEventListener("mouseup", async (e) => {
      if (highlightTimeout) {
        clearTimeout(highlightTimeout);
      }
      highlightTimeout = setTimeout(() => {
        const selection = window.getSelection();
        if (isNotEmptyString()) {
          if (LCAActionBtnContainer && !LCAActionBtnContainer.contains(e.target)) {
            LCAActionBtnContainer.style.top = `${mouseY + scrollY + 2}px`;
            LCAActionBtnContainer.style.left = `${mouseX + scrollX + 2}px`;
            showLCAActionBtn();
          }
          const range = selection.getRangeAt(0);
          const highlightedNode = range.commonAncestorContainer;
          let parentNode;
          // CASE: If the highlighted text is a standalone html node
          if (highlightedNode.nodeType === 1) {
            parentNode = highlightedNode;
            // CASE: If the highlighted text is in a section of an html node
          } else {
            parentNode = highlightedNode.parentNode;
          }
          globalSelectionData.parentNode = parentNode;
          globalSelectionData.range = range;
          globalSelectionData.selection = selection;
        }
      }, 0);
    });
    document.addEventListener("click", (e) => {
      // Checks if the click is outside of tooltip. If so, hide the tooltip.
      if (LCAActionBtnContainer && !LCAActionBtnContainer.contains(e.target) && window.getSelection().toString() === "") {
        hideLCAActionBtn();
      }
    });
    document.addEventListener("mousedown", (e) => {
      if (!LCAActionBtnContainer.contains(e.target)) {
        hideLCAActionBtn();
      }
    });
  }

  /**
   * Handles the behavior for clicking on the LCA Action Button.
   */
  function handleLCAActionBtn() {
    const actionBtnHTML = getLCAActionBtn();
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = actionBtnHTML;
    document.body.appendChild(tempDiv.firstElementChild);
    // LCAActionBtn = document.getElementById("lca-viz-action-btn");
    LCAActionBtnContainer = document.getElementById("lca-viz-action-btn-container");
    setLCAActionBtnState("default");

    LCAActionBtnContainer.addEventListener("click", async () => {
      if (isNotEmptyString()) {
        chartPosX = mouseX;
        chartScrollX = scrollX;
        chartPosY = mouseY;
        chartScrollY = scrollY;
        setLCAActionBtnState("analyzing");
        await makeHighlightTextInteractive(
          globalSelectionData.parentNode,
          globalSelectionData.range,
          globalSelectionData.selection
        );
      }
    });
  }

  // Records the current coordinate of the mouse.
  function recordCurrentMouseCoord() {
    document.addEventListener("mousemove", function (event) {
      mouseX = event.clientX;
      mouseY = event.clientY;

      scrollX = window.scrollX;
      scrollY = window.scrollY;
    });
  }

  /**
   * Creates an interactive chart from Chart.js given the chart configuration and info about the raw materials + parameters.
   * @param {Object} chartConfig An object specifying the properties for Chart.js
   * @param {Array} paramList An array of object containing the raw materials and their parameters. For example:
   *        let data = [
                      {
                        "name": "Copper foil",
                        "emissions": "0.97",
                        "emissions_factor": "0.97"
                      },
                ]
   */
  function createChart(chartConfig) {
    clearTimeout(selectionTimeout);
    if (!chart) {
      const map = document.createElement("div");
      map.setAttribute("id", "lca-viz-map");
      map.setAttribute("role", "main");
      map.classList.add("lca-lexend");

      const paramContainer = document.createElement("div");
      paramContainer.classList.add("lca-viz-param-container");

      paramContainer.innerHTML = relatedMaterialHTML + independentMaterialHTML + processesHTML;

      map.innerHTML = getInteractiveChartHTML(rawMatExplanation);

      const paramSection = document.createElement("div");
      paramSection.classList.add("param-section");

      const paramSpan = document.createElement("span");
      paramSpan.innerHTML = "<b>Parameters:</b>";
      const paramSpan2 = document.createElement("p");
      paramSpan2.classList.add("lcz-mt-4", "fz-16", "lca-viz-param-subtext");
      paramSpan2.innerHTML =
        "Adjust the values below to see the carbon emissions of different materials.";

      paramSection.appendChild(paramSpan);
      paramSection.appendChild(paramSpan2);
      paramSection.appendChild(paramContainer);

      const totalEmissionsSection = document.createElement("div");
      totalEmissionsSection.classList.add("lca-viz-total-emissions-container");
      totalEmissionsSection.classList.add("lcz-mt-8", "lcz-mb-8");

      map.appendChild(totalEmissionsSection);
      map.appendChild(paramSection);
      document.body.appendChild(map);

      chartContainer = document.getElementById("lca-viz-map");

      const canvas = document.getElementById("lca-viz-carbon-chart");
      Chart.defaults.font.family = "Lexend";
      chart = new Chart(canvas, {
        type: "pie",
        data: chartConfig.data,
        options: chartConfig.options,
        plugins: [increaseHeight],
      });
      setChartPosition();
      handleCloseMapButton();
      handleUpDownBtnBehavior();
      handleToggleSwitch();

      requestAnimationFrame(() => {
        chartContainer.classList.add("visible");
        map.focus();
      });

      // Injecting the total emissions
      const totalEmissionsContainer = document.querySelector('.lca-viz-total-emissions-container');
      const totalEmissions = getTotalEmissions();
      const totalEmissionsHTML = getTotalEmissionsHTML(totalEmissions);
      totalEmissionsContainer.innerHTML = totalEmissionsHTML;
      handleCO2eEquivalencyChange(shadowRoot, true);
    }
  }

  /**
   * Sets the position of the chart.
   */
  function setChartPosition() {
    chartContainer.style.top = `${chartPosY + chartScrollY + 8}px`;
    chartContainer.style.left = `${chartPosX + chartScrollX + 8}px`;
  }

  /**
   * Handles closing the chart behavior
   */
  function handleCloseMapButton() {
    document.getElementById("lca-viz-close-map").addEventListener("click", () => {
        hideChart();
        document.querySelector(".lca-viz-mark").classList.add("lca-viz-previously-highlighted");
        document.querySelector(".off-lca-btn").classList.remove("lca-viz-hidden");
      });
    currentHighlightedNode.addEventListener("click", redisplayChart);
  }

  // Redisplay the chart that was closed by the user
  function redisplayChart() {
    if (chart) {
      console.log("redisplaying chart");
      // const element = event.currentTarget;
      const element = document.querySelector(".lca-viz-mark");
      element.classList.remove("lca-viz-previously-highlighted");
      makeChartVisible();
    }

  }

  /**
   * Makes the chart visible.
   * @param {boolean} resetChartPosition Whether to reset the chart position.
   */
  function makeChartVisible(resetChartPosition = false) {
    if (resetChartPosition) {
      setChartPosition();
    }
    const mapElement = document.getElementById("lca-viz-map");
    mapElement.classList.add("lca-viz-map-visible");
    handleDraggableMap();
  }

  // Hides the chart.
  function hideChart() {
    const mapElement = document.getElementById("lca-viz-map");
    mapElement.classList.remove("lca-viz-map-visible");
    mapElement.classList.add("lca-viz-map-hidden");
    clearTimeout(selectionTimeout);
  }

  // Function to increase the height of the chart.js chart.
  const increaseHeight = {
    beforeInit(chart) {
      // Get a reference to the original fit function
      const origFit = chart.legend.fit;
      chart.legend.fit = function fit() {
        origFit.bind(chart.legend)();
        // Increase the height of the legend
        this.height += 25; // Adjust this value as needed
      };
    },
  };

  // Handles the behavior of opening and closing the lca question UI.
  function toggleQuestionButtonState() {
    const openContainer = floatingQMenu;
    const closeContainer = shadowQRoot.getElementById("lca-viz-close-question");
    closeContainer.addEventListener("click", () => {
      hideMasterQContainer();
      openContainer.style.display = "flex";
      requestAnimationFrame(() => {
        openContainer.classList.remove("lcz-hidden-b");
        openContainer.classList.add("lcz-visible-b");
      });
    });
    openContainer.addEventListener("click", () => {
      showMasterQContainer();
      openContainer.style.display = "flex";
      requestAnimationFrame(() => {
        openContainer.classList.add("lcz-hidden-b");
        openContainer.classList.remove("lcz-visible-b");
      });
    });
  }
}

/**
 * Takes in raw materials data and extracts the name of each raw material and emissions, then returns it
 * as an array of objects.
 * @param {Object} data The raw materials data
 * @returns An array of objects containing raw materials and their emissions.
 */
export function extractNameAndEmissions(data) {
  independentMaterialHTML = ``;
  relatedMaterialHTML = ``;
  processesHTML = ``;
  const results = [];
  // Keeps track of the index of every parameter object
  // Process raw materials - related materials ratios
  if (data.raw_materials?.related_materials) {
    data.raw_materials.related_materials.forEach((material, index) => {
      if (material.ratio) {
        const ratioList = material.ratio;
        const textSource = material.text_source;
        relatedMaterialHTML += createRatioSection(ratioList, textSource, index);
        material.ratio.forEach((item) => {
          results.push({
            name: item.name,
            emissions: extractEmissionsFactor(item.carbon_emission_factor)
              .co2e_value,
          });
        });
      }
    });
  }
  // Process raw materials - independent materials
  if (data.raw_materials?.independent_materials) {
    const independentList = data.raw_materials.independent_materials;
    independentMaterialHTML =
      "<div class='lca-viz-independent-container'>" +
        independentList.map((item, index) => {
            const emissionsAmount = item.amount * extractEmissionsFactor(item.carbon_emission_factor).co2e_value;
            results.push({name: item.name, emissions: emissionsAmount,});
            return getParam(item.name, item.index, "g", item.amount, undefined, undefined, undefined);
          }).join("") +
      "</div>";
  }
  return results;
}

// Gets the base domain of the current hostname.
export function getBaseDomain(hostname) {
  const parts = hostname.split(".");
  if (parts.length > 2) {
    return parts.slice(-2).join(".");
  }
  return hostname;
}

/**
 * Enables the question UI form to function properly
 */
function handleQuestionForm() {
  let inputs;
  if (currScenario === "freight") {
    inputs = [
      {
        id: "lca-input-from",
        errorId: "lca-viz-from-error",
        validate: validateText,
      },
      {
        id: "lca-input-to",
        errorId: "lca-viz-to-error",
        validate: validateText,
      },
      {
        id: "lca-input-package-weight",
        errorId: "lca-viz-package-error",
        validate: validatePackageWeight,
      },
    ];
  } else if (currScenario === "energy") {
    inputs = [
      {
        id: "lca-input-package-weight",
        errorId: "lca-viz-package-error",
        validate: validatePackageWeight,
      },
    ];
    // ! Manually set device/process and location field in 'energy' scenario to be optional
    const input1 = shadowQRoot.getElementById("lca-input-from");
    const input2 = shadowQRoot.getElementById("lca-input-to");
    toggleValidation(input1, "lca-viz-from-error", true);
    toggleValidation(input2, "lca-viz-to-error", true);
  }

  const calculateContainer = shadowQRoot.querySelector(
    ".lca-viz-calculate-container-2"
  );
  const formContainer = shadowQRoot.querySelector(".lca-viz-question-form");
  const btnTxt = shadowQRoot.querySelector(".lca-viz-calculate-btn-txt-2");

  inputs.forEach(({ id }) => {
    const input = shadowQRoot.getElementById(id);
    input.addEventListener("input", checkAllValid);
  });

  let loadingInterval;
  calculateContainer.addEventListener("click", async () => {
    if (!calculateContainer.classList.contains("invalid")) {
      // Start loading animation
      let loadingState = 0;
      loadingInterval = setInterval(() => {
        loadingState = (loadingState + 1) % 4;
        btnTxt.textContent = "Calculating" + ".".repeat(loadingState);
      }, 500);
      if (currScenario === "freight") {
        await handleFreightInput();
      } else if (currScenario === "energy") {
        await handleEnergyInput();
      }
    }
  });

  // Handles the energy input.
  async function handleEnergyInput() {
    const formData = new FormData(formContainer);
    const deviceProcessName = formData.get("from");
    const durationVal = formData.get("package-weight");
    const durationUnit = formData.get("package-unit");
    const location = formData.get("to");
    const durationInSeconds = convertToSeconds(durationVal, durationUnit);
    const kwh = (wattage / 1000) * (durationInSeconds / 3600);

    let energyEmissions;
    // If location is not given, use the emissions factor from LLM, which is based on US electricity average.
    if (!location || location === "") {
      // The emissions is in this unit: ~ g CO2eq per 1 kwH
      emissionsPerKwh = extractEmissionsFactor(energyEFactor).co2e_value;
      energyEmissions = parseFloat((kwh * emissionsPerKwh) / 1000);
      // Else, use electricity maps API with location.
    } else {
      const objectBody = {
        location_name: location,
        electricity_used: kwh,
      };
      let response = await fetch(
        LCA_PY_SERVER_URL + "/calculate-electricity-footprint",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(objectBody),
        }
      );
      if (response.ok) {
        const responseData = await response.json();
        energyEmissions = parseFloat(responseData.carbon_footprint);
        emissionsPerKwh = parseFloat(responseData.carbon_intensity);
      } else {
        // !Cannot fetch electricity maps API
        return;
      }
    }
    const data = {
      emissions: energyEmissions,
      device_process: deviceProcessName,
      power: wattage,
      duration: durationVal,
      duration_unit: durationUnit,
      location: location,
    };
    const emissionsResultHTML = getCloudEmissionsResult(data, "energy", energyExplanation);
    getMasterContainer();
    setupLCABannerAndFloatingMenu();
    displayCloudEmissions(emissionsResultHTML, false);
    hideQuestionUI();
    showMasterContainer();
    isPopupActive = true;

    handleIntextEnergy(durationVal, durationUnit);
  }

  /**
   * Allows for users to manipulate the time inside the highlighted text and see the change in emissions.
   * @param {String} inputTime The time value that was used to calculate the emissions.
   * @param {String} inputTimeUnit The time unit that was used to calculate the emissions.
   */
  function handleIntextEnergy(inputTime, inputTimeUnit) {
    durationEUnit = inputTimeUnit;
    const highlightedTextNode = document.querySelectorAll('.lcz-editable-param');
    let editNode;
    highlightedTextNode.forEach((node) => {
      if (node.textContent === (eTimeString + " " + eTimeUnitString)) {
        editNode = node;
      }
    });

    const upDownBtn = document.createElement('div');
    upDownBtn.classList.add('lca-viz-param-bold', 'lca-viz-inline');
    upDownBtn.innerHTML = `
        <span class="lca-viz-origin-number lca-viz-hidden">${inputTime}</span>
        <div class="lca-viz-processes-intext-0 lca-viz-inline" data-value="${eTimeString}">
          ${createUpDownBtn(0, inputTimeUnit, inputTime, "time")}
        </div>
        <span class="lca-viz-param-bold"><b>${inputTimeUnit}</b></span>
    `;
    editNode.replaceWith(upDownBtn);

    const selector = document.querySelector('.lca-viz-up-down-btn-master-0');
    const ratioUpBtn = selector.querySelector(".lca-viz-up");
    const ratioDownBtn = selector.querySelector(".lca-viz-down");
    const index = 0;
    ratioUpBtn.addEventListener("click", () => {
      updateValueEnergy(1, index);
    });
    ratioDownBtn.addEventListener("click", () => {
      updateValueEnergy(-1, index);
    });
    const input = selector.querySelector('.lca-viz-parameter-text');
    input.addEventListener("input", () => {
      const newWeight = parseFloat(input.value);
      if (newWeight >= 1) {
        const index = parseInt(input.id.match(/\d+$/)[0]);
        updateValueEnergy(0, index, newWeight);
      }
    });
  }

  /**
   * Updates the carbon emissions value of the energy popup window
   * @param {Number} duration
   * @param {Number} emissionsPerKwh
   * @param {Number} wattage
   */
  function updateEnergyData() {
    const durationInSeconds = convertToSeconds(durationEVal, durationEUnit);
    const kwh = (wattage / 1000) * (durationInSeconds / 3600);
    // emissions of the energy in kg CO2e
    const energyEmissions = parseFloat((kwh * emissionsPerKwh) / 1000);

    // we need this to make the shadow root active
    getMasterContainer();

    // updates the "Usage Duration"
    const shadowRootTime = shadowRoot.getElementById('lca-viz-e-time-val');
    shadowRootTime.textContent = durationEVal;

    // updates the carbon emissions
    const readableEmissions = getReadableCO2e(energyEmissions);
    const readableCO2e = readableEmissions.co2e_value;
    const readableUnit = readableEmissions.unit;
    const shadowRootEmissions = shadowRoot.getElementById('lcz-root-emissions');
    shadowRootEmissions.textContent = readableCO2e + " " + readableUnit;

    // update the co2e equivalencies
    const milesDriven = formatToSignificantFigures(energyEmissions * 2.5);
    const treesOffset = formatToSignificantFigures(energyEmissions * 0.048);
    let {beefValue, beefUnit} = getBeefInfo(energyEmissions);
    const shadowRootMiles = shadowRoot.getElementById('lcz-miles');
    const shadowRootTrees = shadowRoot.getElementById('lcz-trees');
    const shadowRootBeef = shadowRoot.getElementById('lcz-beef');
    shadowRootMiles.textContent = milesDriven;
    shadowRootTrees.textContent = treesOffset;
    shadowRootBeef.textContent = beefValue + " " + beefUnit;
  }

  /**
   * Handles the value update for energy scenario
   * @param {Number} emissionsPerKwh This will be used to calculate the new emissions.
   * @param {Number} wattage This will be used to calculate the new emissions.
   */
  function updateValueEnergy(weightChange, index, newWeight = null) {
    const inputNode = document.getElementById("lca-viz-input-" + index);
    let currentWeight = parseInt(inputNode.value);
    if (newWeight !== null) {
      currentWeight = newWeight;
    } else {
      if (weightChange < 0 && currentWeight <= 1) {
        return;
      }
      currentWeight += weightChange;
    }

    durationEVal = currentWeight;
    updateEnergyData();
    inputNode.value = currentWeight;
  }

  // Handles the freight input.
  async function handleFreightInput() {
    const formData = new FormData(formContainer);
    const fromAddress = formData.get("from");
    const toAddress = formData.get("to");
    const unit = formData.get("package-unit");
    let totalWeight = parseFloat(formData.get("package-weight"));
    // Converting the weight to kg if unit is originally in lbs.
    if (unit !== "kg") totalWeight = totalWeight * 0.453;
    const currShippingOptions = null;
    const freightData = await getFreightData(fromAddress, toAddress, totalWeight, currShippingOptions, true);
    if (shadowQRoot.querySelector(".freight-container") !== null) {
      await updateFreightContent(freightData);
      hideQuestionUI();
    } else {
      // ! We need this to invoke popup-content.js's initialization.
      getMasterContainer()
        .then(() => {
          hideQuestionUI();
          (async () => {
            await injectPopupContent("freight", freightData);
          })();
        })
        .catch((error) => {
          console.log(error);
        });
      showMasterContainer();
      isPopupActive = true;
    }
  }

  inputs.forEach(({ id, errorId, validate = validateText }) => {
    const input = shadowQRoot.getElementById(id);
    input.addEventListener("input", () => {
      const isValid = validate(input);
      toggleValidation(input, errorId, isValid);
    });
  });
}

// Hides both the question / assistant and the floating menu.
function hideQuestionUI() {
  if (masterQContainer) hideMasterQContainer();
  if (floatingQMenu) {
    hideFloatingQMenu();
  }
}

// Clears the old content of the question UI.
function removeQuestionUI() {
  hideQuestionUI();
  setTimeout(() => {
    if (masterQContainer) {
      masterQContainer.innerHTML = "";
    }
    if (floatingQMenu) floatingQMenu.remove();
  }, 500);
}

// Checks if all the inputs are valid.
function checkAllValid() {
  let inputs;
  if (currScenario === "freight") {
    inputs = [
      {
        id: "lca-input-from",
        errorId: "lca-viz-from-error",
        validate: validateText,
      },
      {
        id: "lca-input-to",
        errorId: "lca-viz-to-error",
        validate: validateText,
      },
      {
        id: "lca-input-package-weight",
        errorId: "lca-viz-package-error",
        validate: validatePackageWeight,
      },
    ];
  } else if (currScenario === "energy") {
    inputs = [
      {
        id: "lca-input-package-weight",
        errorId: "lca-viz-package-error",
        validate: validatePackageWeight,
      },
    ];
  }
  const calculateContainer = shadowQRoot.querySelector(
    ".lca-viz-calculate-container-2"
  );
  let allValid = true;
  inputs.forEach(({ id, errorId, validate }) => {
    const input = shadowQRoot.getElementById(id);
    const isValid = validate(input);
    toggleValidation(input, errorId, isValid);
    if (!isValid) allValid = false; // Ensure all fields are checked
  });
  if (allValid) {
    calculateContainer.classList.add("valid");
    calculateContainer.classList.remove("invalid");
  } else {
    calculateContainer.classList.add("invalid");
    calculateContainer.classList.remove("valid");
  }
}

// Validates the package weight input.
function validatePackageWeight(input) {
  const value = parseFloat(input.value.trim());
  return !isNaN(value) && value > 0;
}

/**
 * Adds an error UI to the inputs if any inputs are empty or invalid.
 * @param {HTMLElement} selector The selector HTML node. This should be the shadowRoot node.
 */
function toggleValidation(input, errorId, isValid) {
  const error = shadowQRoot.getElementById(errorId);
  if (isValid) {
    input.classList.remove("invalid");
    input.classList.add("valid");
    error.style.display = "none";
  } else {
    input.classList.remove("valid");
    input.classList.add("invalid");
    error.style.display = "block";
  }
}

// Hides the Master Question Container.
function hideMasterQContainer() {
  masterQContainer.classList.add("lca-viz-c-hidden");
  masterQContainer.classList.remove("lca-viz-c-visible");
}

// Shows the Master Question Container.
function showMasterQContainer() {
  masterQContainer.classList.remove("lca-viz-c-hidden");
  masterQContainer.classList.add("lca-viz-c-visible");
}

// Hides the Floating Question Menu.
function hideFloatingQMenu() {
  floatingQMenu.style.display = "flex";
  requestAnimationFrame(() => {
    floatingQMenu.classList.add("lcz-hidden-b");
    floatingQMenu.classList.remove("lcz-visible-b");
  });
}


/**
 * Updates the chart data based on the new weight
 * @param {number} newWeight The new value that is being displayed in the UI
 * @param {number} currentWeight The current weight of the parameter
 * @param {number} index The index of the raw material
 */
export function updateChartData(newWeight, index) {
  if (index !== -1) {
    let emissionsFactor = 0;
    const obj = findByIndex(currentChartData, index);
    emissionsFactor = extractEmissionsFactor(
      obj.carbon_emission_factor
    ).co2e_value;

    let newEmissionsValue = parseFloat(
      (emissionsFactor * newWeight).toFixed(2)
    );
    chart.data.datasets[0].data[index] = newEmissionsValue;
    chart.update();

    const totalEmissions = getTotalEmissions();
    updateTotalEmissions(totalEmissions);
  }
}

/**
 * Gets the total emissions of all raw materials in the chart
 * @returns The total emissions of all raw materials in the chart in 'g CO2e'
 */
function getTotalEmissions() {
  if (!chart || !chart.data || !chart.data.datasets || !chart.data.datasets[0]) {
    console.error("Chart data not found!");
    return 0;
  }
  const emissionsData = chart.data.datasets[0].data;
  const totalEmissions = emissionsData.reduce((sum, value) => sum + value, 0);
  console.log("Total Emissions:", totalEmissions, "g CO2e");
  return totalEmissions.toFixed(2);
}

/**
   * Sets the state of the LCA Action Button.
   * @param {String} state The state of the LCA Action Button.
   */
export function setLCAActionBtnState(state) {
  const LCAActionBtnText = document.getElementById("lca-viz-action-btn-text");
  const floatingLCAImg = document.querySelector(".floating-lca-img");
  const LCAActionBtn = document.getElementById("lca-viz-action-btn");
  if (state === "default") {
    floatingLCAImg.src = lca_48;
    LCAActionBtnText.textContent = "";
    LCAActionBtnText.classList.add("lca-viz-hidden");
    LCAActionBtnContainer.classList.add("lca-viz-interactable");
    LCAActionBtn.classList.add("lca-viz-green-hover");
    LCAActionBtnContainer.classList.remove("lca-viz-non-interactable");
  }
  //? new code
  else if (state === "analyzing") {
    floatingLCAImg.src = loading_icon_2;
    LCAActionBtnText.textContent = "Analyzing...";
    LCAActionBtnText.classList.remove("lca-viz-hidden");
    LCAActionBtnContainer.classList.remove("lca-viz-interactable");
    LCAActionBtn.classList.remove("lca-viz-green-hover");
    LCAActionBtnContainer.classList.add("lca-viz-non-interactable"); // Make non-clickable
  } else if (state === "error") {
    floatingLCAImg.src = close_icon_red;
    LCAActionBtnText.textContent = "No raw materials detected.";
    LCAActionBtnText.classList.remove("lca-viz-hidden");
    LCAActionBtnContainer.classList.remove("lca-viz-interactable");
    LCAActionBtn.classList.remove("lca-viz-green-hover");
    LCAActionBtnContainer.classList.add("lca-viz-non-interactable"); // Make non-clickable
  }
}