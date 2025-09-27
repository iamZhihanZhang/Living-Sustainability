
// Utilities method for the freight feature

const LCA_SERVER_URL = process.env.LCA_SERVER_URL || "https://lca-server-api.fly.dev";

const lca_48 = chrome.runtime.getURL("../../../assets/img/lca-48.png");

/**
 * Categorizes the shipping options into ground and air modes
 * @param {String} fromAddress The origin address
 * @param {String} toAddress The destination address
 * @param {Array} shippingOptions The list of all given Fedex shipping options
 * @returns Two arrays, one containing the shipping options that have ground transport mode,
 *          another containing the shipping options that have air transport mode.
 */
export async function categorizeShippingOption(
  fromAddress,
  toAddress,
  shippingOptions
) {
  let airMode = [];
  let groundMode = [];
  console.log("shippingOptions: ", shippingOptions)
  const modes = await Promise.all(
    shippingOptions.map(async (option) => {
      const mode = await getFedexTransportMode(option, fromAddress, toAddress);
      // console.log('option: ', option, '\nmode: ', mode);
      return { option, mode };
    })
  );

  // Categorize the options based on the mode
  modes.forEach(({ option, mode }) => {
    if (mode === "air") {
      // console.log('pushed to air');
      airMode.push(option);
    }
    if (mode === "ground") {
      // console.log('pushed to ground');
      groundMode.push(option);
    }
  });

  showGreenestOption(groundMode);
  return { groundMode, airMode };
}

/**
 * Injects a banner into the fedex webpage to highlight the most eco-friendly shipping options in the given array.
 * @param {Array} optionsArray Array containing a list of shipping options
 */
function showGreenestOption(optionsArray) {
  const availableOptions = document.querySelectorAll(
    ".fdx-c-definitionlist__description--small"
  );
  availableOptions.forEach((option) => {
    const formattedOption = option.outerText.toLowerCase().replace(/®/g, "");
    if (optionsArray.includes(formattedOption)) {
      const parentNode = option.parentNode.parentNode.parentNode.parentNode;
      const priceButton = parentNode.querySelector(".magr-c-rates__button");

      const newContainerHTML = ` <div class="lca-viz-greenest-shipping lcz-mb-16"> ${priceButton.outerHTML} <div class="flex-center lcz-br-4 pd-8 cg-8 green-shipping lca-viz-justify-center"> <img src="${lca_48}" alt="Most eco friendly" class="lcz-icon-16"> <span>Most eco-friendly</span> </div> </div> `;
      // Replace the original button with the new container
      priceButton.outerHTML = newContainerHTML;
    }
  });
}

/**
 * Determines the appropriate transportation mode based on the shipping type and locations
 * @param {String} shippingType The Fedex shipping type (e.g. "fedex ground", "fedex 1day freight")
 * @param {String} fromValue The starting location
 * @param {String} toValue The destination location
 * @returns {String} The appropriate transportation mode, either "air" or "ground"
 */
export async function getFedexTransportMode(shippingType, fromValue, toValue) {
  const shipping_modes = {
    "fedex express saver": "ground",
    "fedex ground": "ground",
    "fedex home delivery": "ground",
    "fedex freight priority": "ground",
    "fedex freight economy": "ground",
    "fedex sameday freight": "air",
    "fedex regional economy": "ground",
    "fedex 1day freight": "air",
    "fedex 2day freight": "air",
    "fedex 3day freight": "air",
    "fedex international priority express": "air",
    "fedex international first": "air",
    "fedex international next flight": "air",
    "fedex international priority": "air",
    "fedex international economy": "air",
    "fedex international connect plus": "air",
    "fedex international priority freight": "air",
    "fedex international deferred freight": "air",
    "fedex international economy freight": "air",
    "fedex international ground": "air",
  };

  let mode = shipping_modes[shippingType];
  if (mode) {
    return mode;
  } else {
    // If it takes longer than this amount of hours by road, then assume the shipping type is air
    let hoursThreshold;
    if (
      shippingType === "fedex sameday" ||
      shippingType === "fedex priority overnight" ||
      shippingType === "fedex priority" ||
      shippingType === "fedex priority express" ||
      shippingType === "fedex standard overnight" ||
      shippingType === "fedex first overnight" ||
      shippingType === "fedex first overnight freight"
    ) {
      hoursThreshold = 6;
    } else if (shippingType === "fedex 2day am") {
      hoursThreshold = 12;
    } else if (shippingType === "fedex 2day") {
      hoursThreshold = 18;
    } else {
      return null;
    }
    try {
      const response = await fetch(LCA_SERVER_URL + "/api/travel-time", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromValue,
          to: toValue,
        }),
      });
      const responseData = await response.json();
      // travelTime is in seconds by default
      const travelTime = responseData.rows[0].elements[0].duration.value;
      if (travelTime / 3600 < hoursThreshold) {
        return "ground";
      }
      return "air";
    } catch (error) {
      console.error("Error in getFedexTransportMode:", error);
      return null;
    }
  }
}

/**
 * Returns the freight data used to display the freight emissions and geo-map.
 * @param {boolean} isHighlight default is false. isHighlight is true when this function is called from the LCA brush scenario.
 * @returns The freight data used to display the freight emissions and geo-map.
 */
export async function getFreightData(
  fromAddress,
  toAddress,
  totalWeight,
  currShippingOptions,
  isHighlight = false
) {
  let groundMode, airMode;
  if (!isHighlight) {
    ({ groundMode, airMode } = await categorizeShippingOption(
      fromAddress,
      toAddress,
      currShippingOptions
    ));
  } else {
    groundMode = [""];
    airMode = [""];
  }

  let freightGroundData;
  let freightAirData;
  let aData;
  let gData;

  console.log("groundMode: ", groundMode);

  if (groundMode.length > 0) {
    const groundData = formatFreightData(
      fromAddress,
      toAddress,
      "ground",
      totalWeight
    );
    freightGroundData = await getFreightEmissions(groundData);
    console.log("freightGroundData: ", freightGroundData);
    if (freightGroundData) {
      gData = {
        co2eValue: parseFloat(freightGroundData.co2e.toFixed(2)),
        groundMode: groundMode,
      };
    } else {
      gData = null;
    }
  }
  if (airMode.length > 0) {
    const airData = formatFreightData(
      fromAddress,
      toAddress,
      "air",
      totalWeight
    );
    freightAirData = await getFreightEmissions(airData);
    if (freightAirData) {
      aData = {
        co2eValue: parseFloat(freightAirData.co2e.toFixed(2)),
        airMode: airMode,
      };
    } else {
      aData = null;
    }
  }

  const formattedFreightData = {
    from: fromAddress,
    to: toAddress,
    air: aData,
    ground: gData,
  };

  const freightData = {
    formatted: formattedFreightData,
    originalAir: freightAirData,
    originalGround: freightGroundData,
  };
  return freightData;
}

/**
 * Gets the freight emissions from the Climatiq API
 * @param {Object} data The data to be sent to the Climatiq API
 * @returns The freight emissions from the Climatiq API
 */
async function getFreightEmissions(data) {
  try {
    const response = await fetch(LCA_SERVER_URL + "/api/freight", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.log(`HTTP error! Status: ${response.status}`);
      return null;
    }

    const responseData = await response.json();
    console.log("API Response: ", responseData);
    return responseData;
  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * Formats the freight data for the Climatiq API
 * @param {String} fromAddress The origin address
 * @param {String} toAddress The destination address
 * @param {String} mode The mode of transportation
 * @param {Number} totalWeight The total weight of the cargo
 * @returns The formatted freight data
 */
export function formatFreightData(fromAddress, toAddress, mode, totalWeight) {
  let transportMode;
  if (mode === "air") {
    transportMode = [
      {
        transport_mode: "road",
      },
      {
        transport_mode: "air",
      },
      {
        transport_mode: "road",
      },
    ];
  }
  if (mode === "ground") {
    transportMode = [
      {
        transport_mode: "road",
      },
    ];
  }
  let rFrom = [
    {
      location: {
        query: fromAddress,
      },
    },
  ];
  let rTo = [
    {
      location: {
        query: toAddress,
      },
    },
  ];
  let cargo = [
    {
      weight: totalWeight,
      weight_unit: "kg",
    },
  ];

  // Combine the route components into one array
  let route = rFrom.concat(transportMode).concat(rTo);
  // Create the final data object
  const data = {
    route: route,
    cargo: cargo[0], // Access the first (and only) object in the cargo array
  };
  // console.log(JSON.stringify(data, null, 2));
  return data;
}