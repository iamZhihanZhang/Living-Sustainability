
// This module contains methods for injecting phone UI into the fedex website.
import { handleCO2eEquivalencyChange, hideElement, showElement } from "../../utils/ui-utils";
import { alignStorageArrays } from "./phone-utils";
import { findGreener } from "../../utils/math-utils";

const question_icon = chrome.runtime.getURL("../../../assets/img/question-icon.png");
const most_green_icon = chrome.runtime.getURL("../../../assets/img/most-green-icon.png");
const equivalent_icon = chrome.runtime.getURL("../../../assets/img/equivalent-icon.png");
const red_trash_icon = chrome.runtime.getURL("../../../assets/img/red-trash-icon.png");

/**
 * @returns {HTMLElement} Returns the skeleton code for phone emissions.
 */
export function getPhoneEmissionsSkeleton() {
  const phoneEmissionsSkeleton = `
    <div class="phone-master-container">
      <section class="phone-container lcz-br-8 pd-16 lcz-mt-12 lcz-hidden-a">
        <div class="lcz-loading-box flex-center lcz-br-8 pd-16 lcz-mt-12">
          <div class="lcz-loader">
            <div class="lca-viz-circle"></div>
            <div class="lca-viz-circle"></div>
            <div class="lca-viz-circle"></div>
          </div>
        </div>
        <section class="phone-spec-container fz-20 lcz-mt-12 lcz-hidden-a"></section>
      </section>

      <section class="compare-phone lcz-br-8 lcz-hidden-a">
        <div class="lcz-mt-24 lcz-mb-16 lca-viz-competitor-section">
          <p class="lcz-margin-0 fz-20 lcz-mb-16 pdl-4"><b>Compare similar phones:</b></p>
          <div class="lca-viz-competitor-container rg-12"></div>
        </div>
      </section>

      <section class="lcz-side-by-side-section lcz-hidden-a lcz-mt-12">
        <div class="side-by-side-container flex-center">
          <div class="lcz-side-by-side-spec-container lcz-grid-1fr-1fr cg-12"></div>
        </div>
      </section>
    </div>
  `;
  return phoneEmissionsSkeleton;
}


/**
 * Displays the carbon emission of the phone being analyzed in the web page.
 * @param {*} currentPhoneData The current phone data
 * @param {Element} selector the shadow root
 */
export function displayPhoneSpecEmissions(currentPhoneData, selector) {
  const data = currentPhoneData;
  console.log("phone data = ");
  console.log(data);

  const container = selector.querySelector(".phone-spec-container");
  const specs = data.specs;
  const deviceName = data.device;

  container.innerHTML += `
    <div class="flex-stretch lca-viz-title-and-question lcz-mt-8">
      <p class="phone-spec-title" id="currentPhone"><b>${deviceName} Estimated Carbon Emissions</b></p>
      <div class="btn lca-viz-btn-primary lca-viz-tooltip"><img src="${question_icon}" alt="Hover me to get additional information" class="lcz-icon-20" id="lca-viz-q-icon">
        <div class="left">
          <h3 class="fz-12 lca-lexend">How are phone emissions calculated?</h3>
          <p class="fz-12 lca-lexend">We use data from phone companies' product carbon footprint reports. If there is no data, a large language model (LLM) is used to estimate emissions based on publicly available data online.</p>
          <i></i>
        </div>
      </div>
    </div>
    <div class="flex-center cg-8 fz-16">
      <p>CO2e Equivalency: </p>
      <select id="lca-viz-unit-select" class="lcz-br-4 pd-4">
        <option value="0">Miles driven 🚗</option>
        <option value="1">Trees offset 🌳</option>
        <option value="2">Beef Consumed 🥩</option>
      </select>
    </div>
  `;

  // let mostGreenOption = footprints[0];
  let mostGreenOption = specs[0];
  specs.forEach((spec, index) => {
    if (index !== 0) {
      const co2eValue = parseFloat(spec.co2e);
      const mostGreenCo2eValue = parseFloat(mostGreenOption.co2e);
      if (co2eValue < mostGreenCo2eValue) {
        mostGreenOption = spec;
      }
    }
  });

  specs.forEach((spec, index) => {
    const co2eValue = parseFloat(spec.co2e);
    const mostGreenCo2eValue = parseFloat(mostGreenOption.co2e);
    const percentageIncrease =
      ((co2eValue - mostGreenCo2eValue) / mostGreenCo2eValue) * 100;

    const isMostGreen = spec.storage === mostGreenOption.storage;
    container.innerHTML += `
      <div class="lcz-details-container fz-16" id=${index + "-c"}>
        <div class="flex-center ${isMostGreen ? "most-green" : ""} cg-4">
          <p><b>${spec.storage} </b>&nbsp;</p>
          ${
            isMostGreen
              ? `<img src="${most_green_icon}" class="lcz-icon-16 emissions-diff-minus lcz-br-4 lcz-margin-0 lca-viz-MEF" title="This is the most eco-friendly option" alt="Most eco-friendly option">`
              : `<span class="emissions-diff-plus fz-12 lcz-br-4 lcz-margin-0"><b>(+${percentageIncrease.toFixed(
                  0
                )}% emissions)</b></span>`
          }
        </div>
        <div class="flex-center co2e-data-container pd-8 lcz-br-8 cg-4 lca-viz-lexend-reg">
          <p class="lcz-margin-0">${co2eValue} kg CO2e</p>
          <img src="${equivalent_icon}" class="lcz-icon-16" alt="Equivalent to">
          <div class="lca-viz-unit-container phone flex-center cg-4">

            <div class="lca-viz-unit-div">
              <div class="flex-center lca-viz-justify-center cg-8">
                <p class="lcz-margin-0 lcz-grey-text fz-16 lca-viz-text-align-center">${Math.ceil(
                  co2eValue * 2.5
                )} miles driven by a car &nbsp;🚗</p>
              </div>
            </div>

            <div class="lca-viz-unit-div">
              <div class="flex-center lca-viz-justify-center cg-8">
                <p class="lcz-margin-0 lcz-grey-text fz-16 lca-viz-text-align-center">${(
                  co2eValue * 0.048
                ).toFixed(1)} trees annually &nbsp;🌳</p>
              </div>
            </div>

            <div class="lca-viz-unit-div">
              <div class="flex-center lca-viz-justify-center cg-8">
                <p class="lcz-margin-0 lcz-grey-text fz-16 lca-viz-text-align-center">${(
                  co2eValue * 0.033
                ).toFixed(2)} kg of beef consumed &nbsp;🥩</p>
              </div>
            </div>

          </div>
        </div>
      </div>
      `;
  });

  const dataSource = getDataSource(currentPhoneData);
  container.innerHTML += dataSource;

  handleCO2eEquivalencyChange(selector);
}

/**
 * Takes in phone object and returns the html code for data source.
 * @param {Object} phoneObject The phone object
 * @returns the html code for data source.
 */
function getDataSource(phoneObject) {
  if (phoneObject.method && phoneObject.method === "given") {
    const txtSourceHTML = `
      <div class="lca-viz-txt-source pdt-12">
        <a href="${phoneObject.source}" class="lca-link fz-16" target="_blank">Data source</a>
      </div>`;
    return txtSourceHTML;
  } else {
    return `<div></div>`;
  }
}


/**
 * Display a side-by-side carbon emissions comparison of two phones
 * @param {Number} phoneId the id of the phone
 * @param {*} currentPhoneData the current phone data
 * @param {*} currentRecommendedPhones the two recommended phone models
 * @param {Element} selector the shadow root
 */
export function displaySideBySideComparison(phoneId, currentPhoneData, currentRecommendedPhones, selector) {
  const currentPhone = currentPhoneData;
  const comparedPhone = currentRecommendedPhones.find(
    (phone) => phone.index === phoneId
  );

  const wrapper = selector.querySelector(".lcz-side-by-side-section");
  const phoneContainer = selector.querySelector(".phone-container");

  let specContainer = selector.querySelector(".lcz-side-by-side-spec-container");
  specContainer.innerHTML = "";
  specContainer.innerHTML += `
    <p class="lcz-margin-0 lcz-side-phone-text fz-16"><b>${currentPhone.device}</b></p>
    <p class="lcz-margin-0 lcz-side-phone-text fz-16"><b>${comparedPhone.device}</b></p>
    <img src="${red_trash_icon}" class="lcz-icon-16 lcz-trash-btn" alt="remove device">
  `;

  let arrayResult = alignStorageArrays(currentPhone.specs, comparedPhone.specs);
  let currentArray = arrayResult[0];
  let comparedArray = arrayResult[1];

  for (let i = 0; i < currentArray.length; i++) {
    const result = findGreener(currentArray[i].co2e, comparedArray[i].co2e);
    // Returns a boolean checking
    specContainer.innerHTML += `
      <div class="lcz-details-container fz-16">
        <div class="flex-center most-green cg-4">
          <p><b>${currentArray[i].storage}</b>&nbsp;</p>
          ${
            currentArray[i].mostEco
              ? `<img src="${most_green_icon}" class="lcz-icon-16 emissions-diff-minus lcz-br-4 lcz-margin-0 lca-viz-MEF" title="This is the most eco-friendly option" alt="Most eco-friendly option">`
              : ""
          }
        </div>
        <div class="flex-center co2e-data-container pd-8 lcz-br-8 cg-4 lca-viz-lexend-reg ${
          result === "one" ? "greener" : result === "two" ? "" : ""
        }">
          <p class="lcz-margin-0">${
            currentArray[i].co2e !== "--"
              ? currentArray[i].co2e + " kg CO2e"
              : "--"
          } </p>
        </div>
      </div>
      <div class="lcz-details-container fz-16">
        <div class="flex-center most-green cg-4">
          <p><b>${comparedArray[i].storage}</b>&nbsp;</p>
          ${
            comparedArray[i].mostEco
              ? `<img src="${most_green_icon}" class="lcz-icon-16 emissions-diff-minus lcz-br-4 lcz-margin-0 lca-viz-MEF" title="This is the most eco-friendly option" alt="Most eco-friendly option">`
              : ""
          }
        </div>
        <div class="flex-center co2e-data-container pd-8 lcz-br-8 cg-4 lca-viz-lexend-reg ${
          result === "one" ? "" : result === "two" ? "greener" : ""
        }">
          <p class="lcz-margin-0">${
            comparedArray[i].co2e !== "--"
              ? comparedArray[i].co2e + " kg CO2e"
              : "--"
          }</p>
        </div>
      </div>
    `;
  }

  const currentPhoneDataSource = getDataSource(currentPhone);
  const comparedPhoneDataSource = getDataSource(comparedPhone);
  specContainer.innerHTML += currentPhoneDataSource;
  specContainer.innerHTML += comparedPhoneDataSource;

  const competitorSection = selector.querySelector(
    ".lca-viz-competitor-section"
  );

  const trashBtn = specContainer.querySelector(".lcz-trash-btn");
  trashBtn.addEventListener("click", () => {
    hideElement(wrapper, "a");

    requestAnimationFrame(() => {
      phoneContainer.classList.remove("lcz-hidden-a");
      phoneContainer.classList.add("lcz-visible-a");
    });

    competitorSection.classList.remove("lcz-hidden-a");
  });

  const lcaBanner = selector.querySelector(".lca-banner");
  lcaBanner.insertAdjacentElement("afterend", wrapper);

  if (phoneContainer.classList.contains("lcz-hidden-a")) {
    hideElement(wrapper, "a");
    showElement(wrapper, "a");
  } else {
    hideElement(phoneContainer, "a");
    showElement(wrapper, "a");
  }
}