
// This module contains methods for injecting cloud UI into Azure website.
import { formatToSignificantFigures, getBeefInfo, getReadableCO2e } from "../../utils/math-utils";

const question_icon = chrome.runtime.getURL("../../../assets/img/question-icon.png");
const sync_icon = chrome.runtime.getURL("../../../assets/img/sync-icon.png");

/**
 * Fills in the carbon information for the cloud and energy popup UI.
 * @param {String} scenario Either "cloud" or "energy"
 * @returns The HTML content of the carbon emissions
 */
export function getCloudEmissionsResult(data, scenario, explanation) {
  let emissions;
  let deviceProcess, power, energyDuration, durationUnit, location;
  let region, instance, duration;
  let milesDriven;
  let treesOffset;
  if (scenario === "cloud") {
    emissions = data.emissions;
    region = data.region;
    instance = data.instance;
    duration = data.duration;
  } else if (scenario === "energy") {
    emissions = data.emissions;
    deviceProcess = data.device_process;
    power = data.power;
    energyDuration = data.duration;
    durationUnit = data.duration_unit;
    if (durationUnit === "s") durationUnit = "second(s)";
    if (durationUnit === "min") durationUnit = "minute(s)";
    if (durationUnit === "h") durationUnit = "hour(s)";
    location = data.location;
    power = formatToSignificantFigures(power);
    // milesDriven = formatToSignificantFigures(emissions * 2.5);
    // treesOffset = formatToSignificantFigures(emissions * 0.048);
  }
  milesDriven = formatToSignificantFigures(emissions * 2.5);
  treesOffset = formatToSignificantFigures(emissions * 0.048);
  const isLocationNull = !location || location === "";

  let { beefValue, beefUnit } = getBeefInfo(emissions);

  const readableEmissions = getReadableCO2e(emissions);
  const readableCO2e = readableEmissions.co2e_value;
  const readableUnit = readableEmissions.unit;

  const infoContent =
    explanation && explanation.trim()
      ? explanation
      : (
        scenario === "cloud"
        ? `<h3 class="fz-12 lca-lexend">How we estimate cloud computing emissions</h3>
           <p class="fz-12 lca-lexend">The total carbon footprint of cloud instance usage consists of both operational and embodied emissions. Operational emissions are calculated by multiplying your instance usage by the provider's energy conversion factors and Power Usage Effectiveness (PUE), then applying regional power grid emissions factors. We combine this with embodied emissions, which account for the manufacturing impact of datacenter servers allocated to your compute usage.  This estimation uses Microsoft Sustainability Calculator, Cloud Carbon Footprint, and Climatiq.</p>`
        : `<h3 class="fz-12 lca-lexend">How we estimate the emissions of use</h3>
           <p class="fz-12 lca-lexend">${explanation ? explanation : `The carbon footprint of use is determined based on the device or process's power consumption and usage duration. The carbon emissions factor is based on the regional average.`}</p>`
      );

  const emissionsResultHTML = `
      <div class="lca-viz-cloud-emissions-container lcz-hidden-a">
        <section class="lca-viz-cloud-container lcz-br-8">
          <div class="lca-viz-cloud-results-info-container pd-16 lcz-mt-12 lcz-hidden-a">
            <div class="flex-stretch lca-viz-title-and-question lcz-mt-8">
              <p class="fz-16 lcz-mt-0 lcz-mb-0"><b>Estimated Carbon Footprint of Use</b></p>
              <div class="btn lca-viz-btn-primary lca-viz-tooltip"><img src="${question_icon}" alt="Hover me to get additional information" class="lcz-icon-20" id="lca-viz-q-icon">
                <div class="left">
                  ${infoContent}
                  <i></i>
                </div>
              </div>
            </div>

            <div class="flex-center cg-8 fz-16 lcz-mb-12">
              <p>CO2e Equivalency: </p>
              <select id="lca-viz-unit-select" class="lcz-br-4 pd-4">
                <option value="0">Miles driven 🚗</option>
                <option value="1">Trees offset 🌳</option>
                <option value="2">Beef Consumed 🥩</option>
              </select>
            </div>

            ${
              emissions
                ? `<div class="freight-emissions flex-column-center lcz-br-8 rg-12 pd-16">
                <span class="fz-20 co2e-value"><b><span id="lcz-root-emissions">${readableCO2e} ${readableUnit}</span> <span class="fz-12">${
                    scenario === "cloud" ? "(per month)" : ""
                  }</span></b></span>

                <div class="lca-viz-unit-container cloud flex-center cg-4">
                  <div class="lca-viz-unit-div">
                    <div class="flex-center lca-viz-justify-center cg-8">
                      <p class="lcz-margin-0 lcz-grey-text fz-16 lca-viz-text-align-center">or <span id="lcz-miles">${milesDriven}</span> miles driven by a car &nbsp;🚗</p>
                    </div>
                  </div>

                  <div class="lca-viz-unit-div">
                    <div class="flex-center lca-viz-justify-center cg-8">
                      <p class="lcz-margin-0 lcz-grey-text fz-16 lca-viz-text-align-center">or <span id="lcz-trees">${treesOffset}</span> trees annually &nbsp;🌳</p>
                    </div>
                  </div>

                  <div class="lca-viz-unit-div">
                    <div class="flex-center lca-viz-justify-center cg-8">
                      <p class="lcz-margin-0 lcz-grey-text fz-16 lca-viz-text-align-center">or <span id="lcz-beef">${beefValue} ${beefUnit}</span> of beef consumed &nbsp;🥩</p>
                    </div>
                  </div>
                </div>
              </div>`
                : `<div class="freight-emissions flex-column-center lcz-br-8 rg-12 pd-16">
                <span class="fz-20 co2e-value"><b>Data unavailable</b></span>
                <div class="flex-center cg-4">
                  <span class="trash-value fz-16">Region or instance is not supported.</span>
                </div>
              </div>`
            }

            ${
              scenario === "cloud"
                ? `
              <p class="fz-16 lcz-mb-2"><b>Region:</b> <br>
                <div class="flex-center cg-8">
                  <span id="lca-viz-cloud-region-value" class="fz-12">${region}</span>
                </div>
              </p>
              <p class="fz-16 lcz-mb-2"><b>Server Instance Type:</b> <br>
                <div class="flex-center cg-8">
                  <span id="lca-viz-cloud-instance-value" class="fz-12">${instance}</span>
                </div>
              </p>
              <p class="fz-16 lcz-mb-2"><b>Usage Rate:</b> <br>
                <span class="fz-12">${duration} hours per day</span>
              </p>
            `
              : `
              <p class="fz-16 lcz-mb-2"><b>Device / Process:</b> <br>
                <div class="flex-center cg-8">
                  <span id="" class="fz-12">${deviceProcess}</span>
                </div>
              </p>
              <p class="fz-16 lcz-mb-2"><b>Usage Duration:</b> <br>
                <div class="flex-center cg-8">
                  <span class="fz-12"><span id="lca-viz-e-time-val">${energyDuration}</span> ${durationUnit}</span>
                </div>
              </p>
              ${
                !isLocationNull
                  ? `<p class="fz-16 lcz-mb-2"><b>Location:</b> <br>
                  <span class="fz-12">${location}</span>
                </p>`
                  : ``
              }
              <p class="fz-16 lcz-mb-2"><b>Power:</b> <br>
                <span class="fz-12">${power} W</span>
              </p>
            `
          }
        </div>
        ${
          scenario === "energy"
            ? `<div class="lcz-loading-box-3 flex-center lcz-br-8 pd-16 lcz-mt-12">
            <div class="lcz-loader">
              <div class="lca-viz-circle"></div>
              <div class="lca-viz-circle"></div>
              <div class="lca-viz-circle"></div>
            </div>
          </div>`
            : ``
        }
      </section>
    </div>
  `;
  return emissionsResultHTML;
}

// Returns the HTML code for the cloud emissions skeleton
export function getCloudEmissionsSkeleton(regionText, cloudSizeText) {
  const cloudEmissionsSkeleton = `
    <div class="lca-viz-cloud-master-container lcz-hidden-a">
      <section class="lca-viz-cloud-container lcz-br-8">
        <div class="lcz-loading-box-3 flex-center lcz-br-8 pd-16 lcz-mt-12">
          <div class="lcz-loader">
            <div class="lca-viz-circle"></div>
            <div class="lca-viz-circle"></div>
            <div class="lca-viz-circle"></div>
          </div>
        </div>
        <div class="lca-viz-cloud-info-container pd-16 lcz-mt-12 lcz-hidden-a">
          <p class="fz-20 lcz-margin-0"><b>Cloud Instance Carbon Emissions</b></p>
          <p class="fz-16 lcz-mb-2"><b>Region:</b> <br>
            <div class="flex-center cg-8">
              <span id="lca-viz-cloud-region-value" class="fz-12">${regionText}</span>
              <img src="${sync_icon}" alt="Sync icon" class="lcz-icon-16">
            </div>
          </p>
          <p class="fz-16 lcz-mb-2"><b>Server Instance Type:</b> <br>
            <div class="flex-center cg-8">
              <span id="lca-viz-cloud-instance-value" class="fz-12">${cloudSizeText}</span>
              <img src="${sync_icon}" alt="Sync icon" class="lcz-icon-16">
            </div>
          </p>
          <p class="fz-16 lcz-mb-8"><b>Usage Duration:</b> <br>
            <span id="lca-viz-cloud-usage-value" class="fz-12">Will your server instance be operating 24/7?</span>
            <span class="lca-viz-asterisk">*</span>
          </p>
          <div class="lca-viz-yes-no-container fz-12 lcz-br-8">
            <div class="lca-viz-yes-button">Yes</div>
            <div class="lca-viz-no-button">No</div>
          </div>
          <div class="lca-viz-number-input-container lca-viz-hidden">
            <label for="quantity"><p class="fz-12">How long will your server instance be operating per day? <span class="lca-viz-asterisk">*</span></p></label>
            <input type="number" id="lca-viz-number-input" class="fz-12 lcz-br-8" name="quantity" min="1" max="24"> &nbsp;<span class="fz-12">hours a day</span>
          </div>
          <br>
          <div class="lca-viz-calculate-container disabled lcz-br-8 pd-4">
            <div class="flex-center lca-viz-calculate-btn">
              <p class="fz-16 lcz-margin-8 lca-viz-calculate-btn-txt">Calculate</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
  return cloudEmissionsSkeleton;
}