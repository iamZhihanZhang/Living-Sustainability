import { setUpFreightGeoMap } from './utils.js';

async function initMap() {
  try {
    const response = await fetch('/get-map-ground-data');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    await setUpFreightGeoMap(data, "ground");
  } catch (error) {
    console.error('Failed to fetch map data:', error);
  }
}

window.addEventListener('load', () => {
  initMap();
});


console.log('hi from ground-map.js');