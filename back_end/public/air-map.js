import { setUpFreightGeoMap } from './utils.js';

async function initMap() {
  try {
    const response = await fetch('/get-map-air-data');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    await setUpFreightGeoMap(data, "air");
  } catch (error) {
    console.error('Failed to fetch map data:', error);
  }
}

window.addEventListener('load', () => {
  initMap();
});

console.log('hi from air-map.js');