
export async function setUpFreightGeoMap(freightDataJSON, mode) {
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  const directionsService = new google.maps.DirectionsService();
  // Create a LatLngBounds object
  const bounds = new google.maps.LatLngBounds();

  let map;
  let routeList = [];
  freightDataJSON.route.forEach((index) => index.type === 'location' && routeList.push(index));

  function initMap(containerId) {
    return new Map(document.getElementById(containerId), {
      zoom: 5,
      mapId: 'bbdcb540ee667737',
    });
  }

  function refitMap(map, bounds) {
    if (map) {
      const mapContainer = map.getDiv();
      mapContainer.style.visibility = 'hidden';

      // Apply fitBounds as soon as the map is ready
      google.maps.event.addListenerOnce(map, 'tilesloaded', () => {
        map.fitBounds(bounds);
        // Show the map container after fitBounds has been applied
        mapContainer.style.visibility = 'visible';
      });
    }
  }

  if (mode === "air") {
    map = initMap("google-maps-air");
    // The pattern will always be:
    //      origin -(road)-> origin airport -(plane)-> destination airport -(road)-> destination
    try {
      const origin = await getLatLng(routeList[0].name);
      const originAirport = await getLatLng(routeList[1].name);
      const destinationAirport = await getLatLng(routeList[2].name);
      const destination = await getLatLng(routeList[3].name);

      renderRoadRoute(origin, originAirport);
      renderPlaneRoute(originAirport, destinationAirport);
      renderRoadRoute(destinationAirport, destination);

      addMarker(origin.lat, origin.lng, routeList[0].name);
      addMarker(destination.lat, destination.lng, routeList[3].name);
      // map.fitBounds(bounds);
      refitMap(map, bounds);
    } catch (error) {
      console.error('Failed to set up map:', error);
    }
  }
  if (mode === "ground") {
    map = initMap("google-maps-ground");
    try {
      // The pattern will always be 'road'
      const origin = await getLatLng(routeList[0].name);
      const destination = await getLatLng(routeList[1].name);
      renderRoadRoute(origin, destination);
      addMarker(origin.lat, origin.lng, routeList[0].name);
      addMarker(destination.lat, destination.lng, routeList[1].name);
      // map.fitBounds(bounds);
      refitMap(map, bounds);
    } catch (error) {
      console.error('Failed to set up map:', error);
    }
  }

  // Function to add a marker and extend bounds
  function addMarker(lat, lng, title) {
    const position = new google.maps.LatLng(lat, lng);
    new AdvancedMarkerElement({
      position: position,
      map: map,
      title: title,
    });
    bounds.extend(position);
  }

  function renderRoadRoute(originC, destinationC) {
    const routeRenderer = new google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true,
      preserveViewport: true
    });
    const routeRequest = {
      origin: { lat: originC.lat, lng: originC.lng },
      destination: { lat: destinationC.lat, lng: destinationC.lng },
      travelMode: 'DRIVING'
    };
    directionsService.route(routeRequest, function (result, status) {
      if (status === 'OK') {
        routeRenderer.setDirections(result);
      } else {
        console.error('Directions request failed due to ' + status);
      }
    });
  }

  function renderPlaneRoute(originC, destinationC) {
    // Manual Polyline for flight path
    const flightPath = new google.maps.Polyline({
      path: [
        { lat: originC.lat, lng: originC.lng },  // Origin Airport
        { lat: destinationC.lat, lng: destinationC.lng }    // Destination Airport
      ],
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2
    });
    flightPath.setMap(map);
  }

  // Converts a place name into coordinates with latitutde and longitude.
  async function getLatLng(placeName) {
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: placeName }, (results, status) => {
        if (status === 'OK') {
          const location = results[0].geometry.location;
          resolve({ lat: location.lat(), lng: location.lng() });
        } else {
          console.error('Geocode was not successful for the following reason: ' + status);
          reject(status);
        }
      });
    });
  }
}
