
// Utilities function for modifying the UI of different features
const lca_48 = chrome.runtime.getURL("../../assets/img/lca-48.png");

/**
 * Handles the changing of different reference units for phone emissions flow.
 * (i.e. changing between "~ kg of trash burned", "~ of miles driven", and "~ of trees cut down" every 3 seconds)
 * @param {Element} selector e.g. the document object, the shadow root, ...
 * @param {Boolean} isRawMaterial
 */
export function handleCO2eEquivalencyChange(selector, isRawMaterial = false) {
  if (isRawMaterial) {
    selector = document;
  }
  const unitSelect = selector.getElementById("lca-viz-unit-select");
  const unitDivsContainer = selector.querySelectorAll(
    ".lca-viz-unit-container"
  );
  // Initialize: show the first unit-div by default
  let currentIndex = 0;
  if (unitSelect && unitDivsContainer) {
    console.log("CALLING handleCO2EquivalencyChange");
    unitDivsContainer.forEach((container) => {
      container.children[currentIndex].classList.add("lca-viz-show");
    });

    unitSelect.addEventListener("change", (e) => {
      const selectedIndex = parseInt(e.target.value);
      console.log("selectedIndex = " + selectedIndex);
      showSelectedUnit(selectedIndex);
    });
  } else {
    console.log("handleCO2EquivalencyChange CANNOT be called");
  }

  // Function to change the displayed unit-div based on dropdown selection
  function showSelectedUnit(index) {
    unitDivsContainer.forEach((container) => {
      console.log("currentIndex = " + currentIndex);
      console.log("newIndex = " + index);
      const oldUnitDiv = container.children[currentIndex];
      const newUnitDiv = container.children[index];
      console.log("unitDivs = ");
      console.dir(oldUnitDiv);
      // Hide the current unit-div
      oldUnitDiv.classList.remove("lca-viz-show");
      oldUnitDiv.classList.add("lca-viz-hide");

      // After fade-out, remove the hide class and show the selected unit
      setTimeout(() => {
        oldUnitDiv.classList.remove("lca-viz-hide");
        newUnitDiv.classList.add("lca-viz-show");
        currentIndex = index;
      }, 300);
    });
  }
}

/**
 * Hides an element using CSS transitions.
 * @param {HTMLElement} element The element to be hidden
 * @param {string} version The animation style. If no version is given, use the default style
 */
export function hideElement(element, version) {
  if (version === "a") {
    element.classList.remove("lcz-visible-a");
    element.classList.add("lcz-hidden-a");
  } else if (version === "b") {
    element.classList.remove("lcz-visible-b");
    element.classList.add("lcz-hidden-b");
  }
}

/**
 * Shows an element. Only works with flex and block elements
 * @param {element} element The element to be shown
 * @param {*} version The animation style. If no version is given, use the default style
 */
export function showElement(element, version) {
  if (version === "a") {
    if (element.classList.contains("flex-center")) {
      element.style.display = "flex";
    } else {
      element.style.display = "block";
    }
    requestAnimationFrame(() => {
      element.classList.remove("lcz-hidden-a");
      element.classList.add("lcz-visible-a");
    });
  } else if (version === "b") {
    if (element.classList.contains("flex-center")) {
      element.style.display = "flex";
    } else {
      element.style.display = "block";
    }
    requestAnimationFrame(() => {
      element.classList.remove("lcz-hidden-b");
      element.classList.add("lcz-visible-b");
    });
  }
}

/**
 * @returns {HTMLElement} the HTML code for LCA Banner
 */
export function getLCABanner() {
  const lcaBanner = `
    <section class="lca-banner flex-stretch">
      <div class="flex-center title-container lcz-br-8 pd-12">
        <img src="${lca_48}" alt="LCA Image" class="lcz-icon-20">
        <p class="title-text fz-20 eco-bold lca-viz-text-align-center"><b>Living Sustainability</b></p>
      </div>
      <div class="flex-center lca-viz-close-container lcz-br-8 pd-16">
        <svg class="lcz-icon-20" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </section>
  `;
  return lcaBanner;
}