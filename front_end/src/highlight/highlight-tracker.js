

// This module contains methods used for handling different interactions for the highlight feature

import { updateValue, updateValueRatio } from "./highlight-utils";

// Handles the behavior of the up and down buttons, used in the raw material scenario
export function handleUpDownBtnBehavior() {
  // ! case: ratio
  const toggleOnContainers = document.querySelectorAll(".lca-viz-param-toggle-on");
  if (toggleOnContainers) {
    toggleOnContainers.forEach((container) => {
      const ratioUpBtnList = container.querySelectorAll(".lca-viz-up");
      const ratioDownBtnList = container.querySelectorAll(".lca-viz-down");
      for (let j = 0; j < ratioUpBtnList.length; j++) {
        const index = parseInt(
          ratioUpBtnList[j].parentElement
            .querySelector(".lca-viz-parameter-text")
            .id.match(/\d+$/)[0]
        );
        ratioUpBtnList[j].addEventListener("click", () => {
          updateValueRatio(1, index);
        });
        ratioDownBtnList[j].addEventListener("click", () => {
          updateValueRatio(-1, index);
        });
      }
      const inputNodeList = container.querySelectorAll(".input-ratio");
      inputNodeList.forEach((input) => {
        input.addEventListener("input", () => {
          const newWeight = parseFloat(input.value);
          if (newWeight > 0) {
            const index = parseInt(input.id.match(/\d+$/)[0]);
            updateValueRatio(0, index, newWeight);
          }
        });
      });
    });
  }

  // ! case: independent - togle off
  const toggleOffContainers = document.querySelectorAll(
    ".lca-viz-param-toggle-off"
  );
  if (toggleOffContainers) {
    toggleOffContainers.forEach((container) => {
      const ratioUpBtnList = container.querySelectorAll(".lca-viz-up");
      const ratioDownBtnList = container.querySelectorAll(".lca-viz-down");
      for (let j = 0; j < ratioUpBtnList.length; j++) {
        const index = parseInt(
          ratioUpBtnList[j].parentElement
            .querySelector(".lca-viz-parameter-text")
            .id.match(/\d+$/)[0]
        );
        ratioUpBtnList[j].addEventListener("click", () => {
          updateValue(1, index);
        });
        ratioDownBtnList[j].addEventListener("click", () => {
          updateValue(-1, index);
        });
      }
      const inputNodeList = container.querySelectorAll(".input-normal");
      inputNodeList.forEach((input) => {
        input.addEventListener("input", () => {
          const newWeight = parseFloat(input.value);
          if (newWeight >= 1) {
            const index = parseInt(input.id.match(/\d+$/)[0]);
            updateValue(0, index, newWeight);
          }
        });
      });
    });
  }

  // ! independent - normal
  const independentContainer = document.querySelector(".lca-viz-independent-container");
  if (independentContainer) {
    const ratioUpBtnList =
      independentContainer.querySelectorAll(".lca-viz-up");
    const ratioDownBtnList =
      independentContainer.querySelectorAll(".lca-viz-down");
    for (let j = 0; j < ratioUpBtnList.length; j++) {
      const index = parseInt(
        ratioUpBtnList[j].parentElement
          .querySelector(".lca-viz-parameter-text")
          .id.match(/\d+$/)[0]
      );
      ratioUpBtnList[j].addEventListener("click", () => {
        updateValue(1, index);
      });
      ratioDownBtnList[j].addEventListener("click", () => {
        updateValue(-1, index);
      });
    }
    const inputNodeList = independentContainer.querySelectorAll(".input-normal");
    inputNodeList.forEach((input) => {
      input.addEventListener("input", () => {
        const newWeight = parseFloat(input.value);
        if (newWeight >= 1) {
          const index = parseInt(input.id.match(/\d+$/)[0]);
          updateValue(0, index, newWeight);
        }
      });
    });
  }
}


/**
   * Handles the "toggle ratio button" that involes toggling between normal parameter vs ratio mode.
   * ! Note: can ONLY call this method ONCE
   */
export function handleToggleSwitch() {
  const toggleSwitches = document.querySelectorAll(".lca-viz-toggle-checkbox");
  const lcaVizMap = document.getElementById("lca-viz-map");
  const originalWidth = lcaVizMap.scrollWidth;
  console.log("originalWidth = " + originalWidth);

  function show(element) {
    element.classList.remove("lca-viz-hidden");
  }
  function hide(element) {
    element.classList.add("lca-viz-hidden");
  }

  toggleSwitches.forEach((toggleSwitch, index) => {
    toggleSwitch.addEventListener("change", () => {
      console.log("detected toggle switch clicking");
      const uniqueId = document.getElementById("lca-viz-r-section-" + index);
      const textDetails = uniqueId.querySelector(".lca-viz-ratio-detail-text");
      const paramToggleOn = uniqueId.querySelector(".lca-viz-param-toggle-on");
      const paramToggleOff = uniqueId.querySelector(".lca-viz-param-toggle-off");
      // const originalWidth = lcaVizMap.scrollWidth;
      const ratioTextList = uniqueId.querySelectorAll(".control-section");
      ratioTextList.forEach((div) => {
        if (div.innerText.length > 16) {
          div.classList.add("fz-12");
        }
      });

      if (toggleSwitch.checked) {
        const ratioContainer = toggleSwitch.closest(".lca-viz-ratio-container");
        const inputList = ratioContainer.querySelectorAll(".input-normal");
        inputList.forEach((input) => {
          const newWeight = 1;
          const index = parseInt(input.id.match(/\d+$/)[0]);
          updateValue(0, index, newWeight);
        });
        lcaVizMap.style.width = `${originalWidth}px`;
        setTimeout(() => {
          hide(textDetails);
          hide(paramToggleOn);
          show(paramToggleOff);
          const newWidth = paramToggleOff.scrollWidth;
          lcaVizMap.style.width = `${newWidth}px`;
        }, 0);
      } else {
        const ratioContainer = toggleSwitch.closest(".lca-viz-ratio-container");
        const inputList = ratioContainer.querySelectorAll(".input-ratio");
        inputList.forEach((input) => {
          const newWeight = input.dataset.ratioValue;
          const index = parseInt(input.id.match(/\d+$/)[0]);
          updateValueRatio(0, index, newWeight);
        });
        lcaVizMap.style.width = `${originalWidth}px`;
        setTimeout(() => {
          show(textDetails);
          hide(paramToggleOff);
          show(paramToggleOn);
          const newWidth = paramToggleOn.scrollWidth + 100;
          lcaVizMap.style.width = `${newWidth}px`;
        }, 0);
      }
      paramToggleOn.style.width = "auto";
      textDetails.style.height = "auto";
    });
  });
}