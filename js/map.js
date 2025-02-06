document.addEventListener("DOMContentLoaded", () => {
  const map = L.map("map").setView([0, 0], 2);

  // Tile layer with noWrap to prevent map from showing edges
  L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      noWrap: true, // Prevent wrapping of the map tiles
  }).addTo(map);

  // Add zoom controls
  L.control.zoom().addTo(map);

  // Helper function: Check if the clicked location is within a country's rough bounding box.
  function getCountryName(lat, lng) {
    // United States (very rough bounding box)
    if (lat >= 24.396308 && lat <= 49.384358 && lng >= -124.848974 && lng <= -66.885444) {
      return "United States";
    }
    // United Kingdom (rough bounding box)
    if (lat >= 49.9 && lat <= 60.9 && lng >= -8.6 && lng <= 1.8) {
      return "United Kingdom";
    }
    // France (rough bounding box)
    if (lat >= 41.3 && lat <= 51.1 && lng >= -5.1 && lng <= 9.6) {
      return "France";
    }
    return null;
  }

  // Add click event to place marker and show either a country name or coordinates
  map.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    
    // Check if the clicked location is within one of our defined countries
    const country = getCountryName(lat, lng);
    if (country) {
      L.marker([lat, lng]).addTo(map)
        .bindPopup("<b>Country:</b> " + country)
        .openPopup();
    } else {
      L.marker([lat, lng]).addTo(map)
        .bindPopup("<b>Clicked location:</b><br>Latitude: " + lat + "<br>Longitude: " + lng)
        .openPopup();
    }
  });

  // Example: Adding a custom icon (optional)
  const customIcon = L.icon({
    iconUrl: 'images/cars1.jpeg', // Replace with your custom icon URL
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25]
  });

  // Add custom marker on a specific location (for example: New York)
  L.marker([40.7128, -74.0060], { icon: customIcon }).addTo(map)
    .bindPopup('Custom Marker at New York')
    .openPopup();
});
