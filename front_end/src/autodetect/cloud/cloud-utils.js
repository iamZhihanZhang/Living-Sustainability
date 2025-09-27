// Utilities method for the cloud feature

const LCA_SERVER_URL = process.env.LCA_SERVER_URL || "https://lca-server-api.fly.dev";

// Fetches the cloud emissions data from the server.
export async function getCloudData(regionText, cloudSizeText, durationText) {
  const region = formatRegionNames(regionText);
  const instance = cloudSizeText.toLowerCase();
  // multiply by 30 because we want the monthly usage (30 days)
  const duration = parseInt(durationText) * 30;
  const data = {
    region: region,
    instance: instance,
    duration: duration,
    duration_unit: "h",
  };
  console.log("input data: ", data);
  if (region && instance && duration) {
    const response = await fetch(LCA_SERVER_URL + "/api/cloud", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    let responseData;
    if (!response.ok) {
      responseData = "";
    } else {
      responseData = await response.json();
    }
    console.log("responseData: ", responseData);
    return responseData;
  }
}

// Formats the region name
export function formatRegionNames(input) {
  // Remove the part within parentheses (e.g., "(US)")
  let regionName = input.replace(/\(.*?\)\s*/, "");
  // Convert to lowercase
  regionName = regionName.toLowerCase();
  // Replace spaces with underscores
  regionName = regionName.replace(/\s+/g, "_");
  return regionName;
}

// Formats the instance names for the cloud emissions
export function formatInstanceNames(input) {
  // Remove the "Standard" prefix
  let instanceName = input.replace(/^Standard_/, "");
  // Keep only the part before the first space (which is the instance name)
  instanceName = instanceName.split(" ")[0];
  // Replace any "-" with "_"
  instanceName = instanceName.replace(/-/g, "_");
  return instanceName;
}

// Checks if the number input is filled
export function checkIsNumberInputFilled(shadowRoot) {
  const numberInputContainer = shadowRoot.querySelector(
    ".lca-viz-number-input-container"
  );
  const numberInput = shadowRoot.getElementById("lca-viz-number-input");
  if (numberInput.value && numberInput.value > 0) {
    return true;
  } else if (numberInputContainer.classList.contains("lca-viz-hidden")) {
    return true;
  }
  return false;
}
