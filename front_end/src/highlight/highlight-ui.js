
// This module contains methods for injecting the UI for the highlight feature.

const lca_48 = chrome.runtime.getURL("../../assets/img/lca-48.png");
const question_icon = chrome.runtime.getURL("../../assets/img/question-icon.png");

/**
   * Gets the LCA Action Button HTML.
   * @returns The LCA Action Button HTML.
   */
export function getLCAActionBtn() {
  const actionBtn = `
    <div id="lca-viz-action-btn-container" class="pd-12">
      <div class="flex-center lca-viz-interactable pd-12 lcz-br-8 cg-8" id="lca-viz-action-btn">
        <img src="${lca_48}" alt="LCA Image" class="floating-lca-img lcz-icon-20 lcz-mb-0">
        <span class="lca-viz-hidden lca-lexend fz-14" id="lca-viz-action-btn-text"></span>
      </div>
    </div>
  `;
  return actionBtn;
}

// Returns the HTML code for the interactive chart
export function getInteractiveChartHTML(explanation) {
  return `
        <div class="flex-center lca-viz-header cg-12 pd-12">
          <div class="flex-center cg-12 lca-viz-header-title">
            <img alt="logo" src="${lca_48}" class="lcz-icon-20 lca-viz-lca-logo">
            <span><b>Living Sustainability</b></span>
          </div>
          <button id="lca-viz-close-map" class="lca-viz-close-button flex-center">
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="flex-stretch lca-viz-title-and-question lcz-mt-8">
          <span class="lca-viz-raw-material-title"><b>Estimated Carbon Footprint of Raw Materials</b></span>
          <div class="btn lca-viz-btn-primary lca-viz-tooltip"><img src="${question_icon}" alt="Hover me to get additional information" class="lcz-icon-20" id="lca-viz-q-icon">
            <div class="left">
              <h3 class="fz-12 lca-lexend">How are raw material emissions calculated?</h3>
              <p class="fz-12">${explanation}</p>
              <i></i>
            </div>
          </div>
        </div>
        <div class="lca-viz-canvas flex-center lca-viz-justify-center">
          <canvas id="lca-viz-carbon-chart"></canvas>
        </div>
    `;
}


/**
   * Returns the HTML for up and down button given the parameter.
   */
export function createUpDownBtn(index, unit, defaultValue, type) {
  const upDownBtn = `
        <div class="lca-viz-special-text-container-2 lca-viz-up-down-btn-master-${index} lca-viz-up-down-btn-master-${index}-${type}">
          <div class="lca-viz-special-text-intext lca-viz-active-st lca-viz-param-fill">
            <input class="lca-viz-parameter-text input-normal lca-viz-parameter-2 lca-viz-fnt-inherit" id="lca-viz-input-${index}" data-type="${type}" data-value-unit="${unit}" type="number" value="${defaultValue}">
            <div class="lca-viz-up-down-btn-container-intext flex-column">
              <div class="lca-viz-active lca-viz-up-down-btn lca-viz-up">
                <svg width="100%" height="100%" viewBox="0 0 9 7" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3.60595 1.24256C3.99375 0.781809 4.7032 0.781808 5.091 1.24256L8.00777 4.70806C8.53906 5.3393 8.09032 6.30353 7.26525 6.30353L1.4317 6.30353C0.606637 6.30353 0.157892 5.33931 0.689181 4.70807L3.60595 1.24256Z" fill="currentColor"/>
                </svg>
              </div>
              <div class="lca-viz-active lca-viz-up-down-btn lca-viz-down">
                <svg width="100%" height="100%" viewBox="0 0 9 7" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.09107 5.74914C4.70327 6.20989 3.99382 6.20989 3.60602 5.74914L0.689251 2.28363C0.157962 1.65239 0.606707 0.688168 1.43177 0.688168L7.26532 0.688168C8.09039 0.688168 8.53913 1.65239 8.00784 2.28363L5.09107 5.74914Z" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
  `;
  return upDownBtn;
}