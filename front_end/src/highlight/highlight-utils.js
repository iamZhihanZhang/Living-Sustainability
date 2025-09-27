// Utilities function for the highlight feature

import { updateChartData, setLCAActionBtnState, extractNameAndEmissions } from "../content";

const LCA_SERVER_URL = process.env.LCA_SERVER_URL || "https://lca-server-api.fly.dev";

// Escape special characters in material names for regex
export function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Replaces an HTML element with a new tag while retaining its styles, classes, attributes, and content.
 * @param {*} oldNode
 * @param {*} newTagName
 * @param {*} newClasses
 * @returns The modified node
 */
export function replaceTagNameAndKeepStyles(oldNode, newTagName, newClasses) {
  const newNode = document.createElement(newTagName);
  newNode.classList.add(...newClasses);
  // Copy existing classes
  oldNode.classList.forEach((cls) => newNode.classList.add(cls));
  // Copy inline styles
  newNode.style.cssText = oldNode.style.cssText;
  // Copy the content of old node into the new node
  while (oldNode.firstChild) {
    newNode.appendChild(oldNode.firstChild);
  }
  // Copy the atrributes of old node into the new node
  for (const attr of oldNode.attributes) {
    if (attr.name !== "class" && attr.name !== "style") {
      newNode.setAttribute(attr.name, attr.value);
    }
  }
  return newNode;
}


// Updates the value of the ratio input
export function updateValueRatio(weightChange, index, newWeight = null) {
  const inputNode = document.getElementById("input-ratio-no-" + index);
  const closestToggleContainer = inputNode.closest(".lca-viz-param-toggle-on");
  let currentWeight = parseInt(inputNode.value);

  if (newWeight !== null) {
    currentWeight = newWeight;
  } else {
    if (weightChange < 0 && currentWeight <= 1) {
      return;
    }
    currentWeight += weightChange;
  }

  const ratioValue = inputNode.dataset.ratioValue;
  const scalingFactor = currentWeight / ratioValue;

  updateChartData(currentWeight, index);
  inputNode.value = currentWeight;

  // calculate the new weight of the related materials
  const otherInputs = closestToggleContainer.querySelectorAll(".input-ratio");
  otherInputs.forEach((otherInputNode) => {
    if (otherInputNode.id !== "input-ratio-no-" + index) {
      console.log("currentWeight = " + otherInputNode.value);
      const otherNewWeight = parseFloat(
        (otherInputNode.dataset.ratioValue * scalingFactor).toFixed(2)
      );
      console.log("newWeight = " + otherNewWeight);
      const otherIndex = parseInt(otherInputNode.id.match(/\d+$/)[0]);
      updateChartData(otherNewWeight, otherIndex);
      otherInputNode.value = otherNewWeight;
    }
  });
}


/**
   * Updates the value of the independent materials, and toggle-off materials
   */
export function updateValue(weightChange, index, newWeight = null) {
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
  updateChartData(currentWeight, index);
  inputNode.value = currentWeight;
}

// Get the "notes" section that explains how the data is calculated
export function getExplanation(materialList) {
  if (materialList && materialList.raw_materials && materialList.raw_materials.notes) {
    return materialList.raw_materials.notes;
  }
  return "We are using a large language model (LLM) to extract relevant raw materials and conduct a life cycle assessment (LCA) of the raw materials using available public datasets on the internet.";
}

/**
   * Takes in materialList and returns two arrays containing the name of all the raw materials and processes.
   * @param {Object} materialList
   * @returns two arrays containing the name of all the raw materials and processes.
   */
export function getMaterialNames(materialList) {
  let rawMaterialNames = [];
  let processesNames = [];
  // Check for raw materials and related materials -> ratio
  if (materialList.raw_materials?.related_materials) {
    materialList.raw_materials.related_materials.forEach(
      (relatedMaterial) => {
        if (relatedMaterial.ratio) {
          relatedMaterial.ratio.forEach((item) => {
            rawMaterialNames.push(item.name);
          });
        }
      }
    );
  }
  // Check for raw materials and independent materials
  if (materialList.raw_materials?.independent_materials) {
    materialList.raw_materials.independent_materials.forEach(
      (independentMaterial) => {
        rawMaterialNames.push(independentMaterial.name);
      }
    );
  }
  // Check for processes
  if (materialList.processes) {
    materialList.processes.forEach((process) => {
      processesNames.push({
        name: process.name,
        power_original: process.power_original,
        power_original_unit: process.power_original_unit,
        time_original: process.time_original,
        time_original_unit: process.time_original_unit,
        index: process.index,
      });
    });
  }
  return {
    rawMaterialNames: rawMaterialNames,
    processesNames: processesNames,
  };
}


/**
   * Takes in a sentence and uses LLM to determine the relevant sentences that can be used to display a carbon chart.
   * Returns a JSON that contains information about each identified raw materials and their parameters.
   * If the highlightedText does not have sufficient information, the data will return null.
   * @param {String} highlightedText
   * @returns a JSON that contains information about each identified raw materials and their parameters.
   */
export async function getValidSentence(highlightedText) {
  const jsonObject = {
    text: highlightedText,
  };
  try {
    const response = await fetch(LCA_SERVER_URL + "/api/evaluate-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonObject),
    });

    if (response.ok) {
      const responseData = await response.json();
      if (responseData) {
        return responseData;
      }
      return null; // If responseData doesn't have the expected structure
    } else {
      setLCAActionBtnState("error");
      return null;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    setLCAActionBtnState("error"); // Handle errors gracefully
    return null;
  }
}

/**
 * Checks if the selected text is not empty.
 * @returns {boolean} True if the selected text is not empty, false otherwise.
 */
export function isNotEmptyString() {
  const selection = window.getSelection();
  return selection.toString().length > 0 && /\S/.test(selection.toString());
}


/**
 * Gets the chart configuration.
 * @param {String} carbonInfo
 * @returns JSON Object
 */
export function getChartConfig(currentChartData) {
  const cData = extractNameAndEmissions(currentChartData);
  const rawLabels = cData.map((item) => item.name);
  const emissionsData = cData.map((item) => item.emissions);
  const chartData = {
    labels: rawLabels,
    datasets: [
      {
        label: "",
        data: emissionsData,
        fill: false,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(255, 159, 64, 0.2)",
          "rgba(255, 205, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(201, 203, 207, 0.2)",
          "rgba(255, 127, 80, 0.2)",
          "rgba(144, 238, 144, 0.2)",
          "rgba(173, 216, 230, 0.2)",
          "rgba(221, 160, 221, 0.2)",
          "rgba(240, 128, 128, 0.2)",
        ],
        borderColor: [
          "rgb(255, 99, 132)",
          "rgb(255, 159, 64)",
          "rgb(255, 205, 86)",
          "rgb(75, 192, 192)",
          "rgb(54, 162, 235)",
          "rgb(153, 102, 255)",
          "rgb(201, 203, 207)",
          "rgb(255, 127, 80)",
          "rgb(144, 238, 144)",
          "rgb(173, 216, 230)",
          "rgb(221, 160, 221)",
          "rgb(240, 128, 128)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    layout: {
      padding: {
        bottom: 25,
      },
    },
    plugins: {
      legend: {
        display: true, // Show legend for pie/donut chart
        position: "top",
        labels: {
          padding: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const label = tooltipItem.label || "";
            const value = tooltipItem.raw;
            return `${label}: ${value} g CO2e`; // Add unit in tooltip
          },
        },
      },
      datalabels: {
        anchor: "end",
        align: "end",
        formatter: function (value) {
          return `${value} g CO2e`;
        },
      },
    },
  };
  return { data: chartData, options: options };
}

  // Validates the text input.
export function validateText(input) {
  return input.value.trim() !== "";
}