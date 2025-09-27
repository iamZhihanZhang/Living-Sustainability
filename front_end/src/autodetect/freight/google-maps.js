
// Contains all of the function responsible for injecting geo-map for the freight feature

const LCA_SERVER_URL = process.env.LCA_SERVER_URL || "https://lca-server-api.fly.dev";

// Loads the Google maps
export async function loadGoogleMaps(shadowRoot, freightAirData, freightGroundData) {
  if (freightAirData) {
    await sendGoogleMapsData(freightAirData, "air", () => {
      injectGoogleMaps(shadowRoot, "air");
    });
  }
  if (freightGroundData) {
    await sendGoogleMapsData(freightGroundData, "ground", () => {
      injectGoogleMaps(shadowRoot, "ground");
    });
  }
}

// Sends the Google maps data to the server
async function sendGoogleMapsData(data, mode, callback) {
  let POST_URL = "";
  if (mode === "air") {
    POST_URL = "/post-google-maps-air";
  }
  if (mode === "ground") {
    POST_URL = "/post-google-maps-ground";
  }
  const response = await fetch(LCA_SERVER_URL + POST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (response.ok) {
    console.log("Data sent successfully");
    callback();
  } else {
    console.error("Failed to send data");
  }
}

// Injects the Google maps into the maps container
function injectGoogleMaps(shadowRoot, mode) {
  const iframe = document.createElement("iframe");
  let mapsContainer;
  if (mode === "air") {
    console.log("INJECTING AIR MAP");
    iframe.src = (process.env.LCA_SERVER_URL + '/air-map.html') || "https://lca-server-api.fly.dev/air-map.html"; // URL of the hosted iframe
    iframe.id = "lca-viz-air-map";
    mapsContainer = shadowRoot.querySelector(".lca-viz-google-maps-air");
  }
  if (mode === "ground") {
    iframe.src = (process.env.LCA_SERVER_URL + '/ground-map.html') || "https://lca-server-api.fly.dev/ground-map.html"; // URL of the hosted iframe
    iframe.id = "lca-viz-ground-map";
    console.log("INJECTING GROUND MAP");
    mapsContainer = shadowRoot.querySelector(".lca-viz-google-maps-ground");
  }

  iframe.style.width = "350px";
  iframe.style.height = "170px";
  iframe.style.border = "none";
  iframe.style.overflow = "hidden";
  iframe.scrolling = "no";

  mapsContainer.appendChild(iframe);
}