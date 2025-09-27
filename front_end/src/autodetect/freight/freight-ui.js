
// This module contains methods for injecting freight UI into the fedex website.

import { getReadableUnit } from "../../utils/math-utils";

const airplane_icon = chrome.runtime.getURL("../../../assets/img/airplane-icon.png");
const truck_icon = chrome.runtime.getURL("../../../assets/img/truck-icon.png");
const question_icon = chrome.runtime.getURL("../../../assets/img/question-icon.png");

// Returns the HTML for the freight UI content
export function getFreightHTMLContent(freightData) {
  if (!freightData) {
    return getInvalidFreightData();
  }
  const from = freightData.from;
  const to = freightData.to;
  // co2eValue unit is kg

  // & New data
  const airData = freightData.air;
  const groundData = freightData.ground;

  let airHTML = ``;
  let groundHTML = ``;

  let airDiffHTML = ``;
  let groundDiffHTML = ``;
  if (airData && groundData) {
    const airEmission = airData.co2eValue;
    const groundEmission = groundData.co2eValue;
    const difference = airEmission - groundEmission;
    const airDiff = parseInt((difference / groundEmission) * 100);
    // const groundDiff = (parseInt((difference / airEmission) * 100));
    if (airEmission > groundEmission) {
      airDiffHTML = `<p class="emissions-diff-plus fz-12 lcz-br-4 lcz-margin-0"><b>+${airDiff}% emissions</b></p>`;
      // groundDiffHTML = `<p class="emissions-diff-minus fz-12 br-4 margin-0"><b>-${groundDiff}% emissions</b></p>`;
    } else {
      airDiffHTML = `<p class="emissions-diff-minus fz-12 lcz-br-4 lcz-margin-0"><b>-${airDiff}% emissions</b></p>`;
      // groundDiffHTML = `<p class="emissions-diff-plus fz-12 br-4 margin-0"><b>+${groundDiff}% emissions</b></p>`;
    }
  }

  function formatShippingText(option) {
    return option
      .split(" ")
      .map((word) => {
        if (word.toLowerCase() === "fedex") {
          return "FedEx";
        }
        if (["3day", "2day", "1day"].includes(word.toLowerCase())) {
          return word.charAt(0) + "Day"; // Converts '3day' to '3Day', '2day' to '2Day', etc.
        }
        if (word.toLowerCase() === "am") {
          return "AM"; // Converts 'Am' to 'AM'
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); // Capitalize first letter
      })
      .join(" ");
  }

  let titleText = "Estimated Carbon Footprint of Transport";

  if (airData) {
    const airCo2eValue = airData.co2eValue;
    let airTrashValue = airCo2eValue / 1.15;
    const weightObject = getReadableUnit(airTrashValue);
    airTrashValue = weightObject.weight;
    // const trashUnit = weightObject.unit;
    const shippingOptionsText = airData.airMode
      .map(formatShippingText)
      .join(", ");
    airHTML = `
      <div class="options-container">
        <p class="shipping-options fz-12 lcz-mb-4">
          <img src="${airplane_icon}" class="lcz-icon-14 align-middle" alt="airplane icon">
          <b>By Air: </b>
        </p>
        ${airDiffHTML}
        <p class="fz-12 lcz-mt-4 lcz-mb-4">${shippingOptionsText}</p>
        <div class="freight-emissions flex-column-center lcz-br-8 rg-12 pd-16">
          <span class="fz-20 co2e-value lcz-mt-4"><b>${airCo2eValue} kg CO2e</b></span>
          <div class="lca-viz-unit-container freight flex-center cg-4">
            <div class="lca-viz-unit-div">
              <div class="flex-center lca-viz-justify-center cg-8">
                <p class="lcz-margin-0 lcz-grey-text fz-16 lca-viz-text-align-center">or ${Math.ceil(
                  airCo2eValue * 2.5
                )} miles driven by a car &nbsp;🚗</p>
              </div>
            </div>

            <div class="lca-viz-unit-div">
              <div class="flex-center lca-viz-justify-center cg-8">
                <p class="lcz-margin-0 lcz-grey-text fz-16 lca-viz-text-align-center">or ${(
                  airCo2eValue * 0.048
                ).toFixed(1)} trees annually &nbsp;🌳</p>
              </div>
            </div>

            <div class="lca-viz-unit-div">
              <div class="flex-center lca-viz-justify-center cg-8">
                <p class="lcz-margin-0 lcz-grey-text fz-16 lca-viz-text-align-center">or ${(
                  airCo2eValue * 0.033
                ).toFixed(2)} kg of beef consumed &nbsp;🥩</p>
              </div>
            </div>
          </div>
        </div>
        <div class="lca-viz-google-maps-air flex-center lcz-mt-8"></div>
      </div>
    `;
  }
  if (groundData) {
    const groundCo2eValue = groundData.co2eValue;
    let groundTrashValue = groundCo2eValue / 1.15;
    const weightObject = getReadableUnit(groundTrashValue);
    groundTrashValue = weightObject.weight;
    // const trashUnit = weightObject.unit;
    console.log("ground shipping options = " + groundData.groundMode);
    const shippingOptionsText = groundData.groundMode
      .map(formatShippingText)
      .join(", ");
    groundHTML = `
      <div class="options-container">
        <p class="shipping-options fz-12 lcz-mb-4">
          <img src="${truck_icon}" class="lcz-icon-14 align-middle" alt="truck icon">
          <b>By Ground: </b>
        </p>
        ${groundDiffHTML}
        <p class="fz-12 lcz-mt-4 lcz-mb-4">${shippingOptionsText}</p>
        <div class="freight-emissions flex-column-center lcz-br-8 rg-12 pd-16">
          <span class="fz-20 co2e-value lcz-mt-4"><b>${groundCo2eValue} kg CO2e</b></span>
          <div class="lca-viz-unit-container freight flex-center cg-4">
            <div class="lca-viz-unit-div">
              <div class="flex-center lca-viz-justify-center cg-8">
                <p class="lcz-margin-0 lcz-grey-text fz-16 lca-viz-text-align-center">or ${Math.ceil(
                  groundCo2eValue * 2.5
                )} miles driven by a car &nbsp;🚗</p>
              </div>
            </div>

            <div class="lca-viz-unit-div">
              <div class="flex-center lca-viz-justify-center cg-8">
                <p class="lcz-margin-0 lcz-grey-text fz-16 lca-viz-text-align-center">or ${(
                  groundCo2eValue * 0.048
                ).toFixed(1)} trees annually &nbsp;🌳</p>
              </div>
            </div>

            <div class="lca-viz-unit-div">
              <div class="flex-center lca-viz-justify-center cg-8">
                <p class="lcz-margin-0 lcz-grey-text fz-16 lca-viz-text-align-center">or ${(
                  groundCo2eValue * 0.033
                ).toFixed(2)} kg of beef consumed &nbsp;🥩</p>
              </div>
            </div>
          </div>
        </div>
        <div class="lca-viz-google-maps-ground flex-center lcz-mt-8"></div>
      </div>
    `;
  }
  if (!airData && !groundData) {
    titleText =
      "We're unable to determine the carbon emissions for the specified locations.";
  }

  const freightEmissions = `
    <div class="freight-container lcz-br-8 pd-16 lcz-mt-12 lcz-hidden-a">
      <div class="lcz-loading-box-2 flex-center lcz-br-8 pd-16 lcz-mt-12">
        <div class="lcz-loader">
          <div class="lca-viz-circle"></div>
          <div class="lca-viz-circle"></div>
          <div class="lca-viz-circle"></div>
        </div>
      </div>
      <div class="freight-content lcz-hidden-a">

        <div class="flex-stretch lca-viz-title-and-question lcz-mt-8">
          <p class="fz-16 lcz-mt-0 mb-16"><b>${titleText}</b></p>
          <div class="btn lca-viz-btn-primary lca-viz-tooltip"><img src="${question_icon}" alt="Hover me to get additional information" class="lcz-icon-20" id="lca-viz-q-icon">
            <div class="left">
              <h3 class="fz-12 lca-lexend">How are package emissions calculated?</h3>
              <p class="fz-12 lca-lexend">We are using Climatiq's Intermodal Services, which collects data from various sources to calculate the shipping emissions, including GLEC v3 Framework, ISO 14083 standard, Emission Factor Database (EFDB), OpenStreetMap, and more.</p>
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
        <div>
          ${groundHTML}
          ${airHTML}
        </div>
        <div class="shipping-container">
          <p class="fz-12"><b>Transport Details</b></p>
          <div class="shipping-info fz-12">
            <p class="from-to-text"><b>From:</b> <span id="f-from">${from}</span></p>
            <p class="from-to-text"><b>To:</b> <span id="t-to">${to}</span></p>
          </div>
        </div>
      </div>
    </div>
  `;
  return freightEmissions;
}

// Returns the HTML for invalid freight data
function getInvalidFreightData() {
  return `<div class="freight-container lcz-br-8 pd-16 lcz-mt-12">
      <div class="lcz-loading-box-2 flex-center lcz-br-8 pd-16 lcz-mt-12 lcz-hidden-a">
        <div class="lcz-loader">
          <div class="lca-viz-circle"></div>
          <div class="lca-viz-circle"></div>
          <div class="lca-viz-circle"></div>
        </div>
      </div>
      <div class="freight-content lcz-visible-a" style="display: block;">
        <div class="flex-stretch lca-viz-title-and-question lcz-mt-8">
          <p class="fz-16 lcz-mt-0 lcz-mb-16"><b>The shipping data cannot be found</b></p>
          <div class="btn lca-viz-btn-primary lca-viz-tooltip"><img src="chrome-extension://moaglnlpoploemkipmdjfmhcjfbandkm/../assets/img/question-icon.png" alt="Hover me to get additional information" class="lcz-icon-20" id="lca-viz-q-icon">
            <div class="left">
              <h3 class="fz-12 lca-lexend">How are package emissions calculated?</h3>
              <p class="fz-12 lca-lexend">We are using Climatiq's Intermodal Services, which collects data from various sources to calculate the shipping emissions, including GLEC v3 Framework, ISO 14083 standard, Emission Factor Database (EFDB), OpenStreetMap, and more.</p>
              <i></i>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}