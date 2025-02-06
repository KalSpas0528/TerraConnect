document.addEventListener("DOMContentLoaded", () => {
  // Initialize the map
  const map = L.map("map").setView([20, 0], 2);

  // Use CartoDB Positron tiles for English-only labels
  L.tileLayer("https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
  }).addTo(map);

  // Variable to toggle marker creation
  let markersEnabled = true;

  // Custom control to toggle marker creation
  const markerToggleControl = L.control({ position: 'topright' });
  markerToggleControl.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'leaflet-bar');
    const button = L.DomUtil.create('button', '', div);
    button.innerHTML = "Markers: ON";
    button.style.backgroundColor = "white";
    button.onclick = function(e) {
      e.preventDefault();
      markersEnabled = !markersEnabled;
      button.innerHTML = markersEnabled ? "Markers: ON" : "Markers: OFF";
    };
    return div;
  };
  markerToggleControl.addTo(map);

  // Add click event to the map for marker creation (if enabled)
  map.on('click', function(e) {
    // Do nothing if markers are disabled
    if (!markersEnabled) return;
    
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    
    // For demonstration, we simply add a marker with a popup of the coordinates.
    L.marker([lat, lng]).addTo(map)
      .bindPopup("<b>Clicked location:</b><br>Latitude: " + lat.toFixed(4) + "<br>Longitude: " + lng.toFixed(4))
      .openPopup();
  });

  // Load GeoJSON for countries (make sure you have a valid countries.geojson file in your project or update the URL)
  fetch('countries.geojson')
    .then(response => response.json())
    .then(data => {
      // Create a GeoJSON layer with the country boundaries
      const geojsonLayer = L.geoJSON(data, {
        style: function(feature) {
          return {
            color: 'blue',
            weight: 1,
            fillOpacity: 0
          };
        },
        onEachFeature: function(feature, layer) {
          // Add a click event to highlight the country boundary
          layer.on('click', function(e) {
            // Reset style for all countries
            geojsonLayer.resetStyle();
            // Highlight the clicked country
            layer.setStyle({
              color: 'red',
              weight: 3
            });
            // Optionally, show the country name (if available in properties)
            if (feature.properties && feature.properties.name) {
              layer.bindPopup("<b>Country:</b> " + feature.properties.name).openPopup();
            }
          });
        }
      }).addTo(map);
    })
    .catch(err => console.error("Error loading countries GeoJSON:", err));

  // Example: Adding a custom icon (optional)
  const customIcon = L.icon({
    iconUrl: 'images/cars1.jpeg', // Replace with your custom icon URL
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25]
  });

  // Add custom marker on a specific location (for example: New York)
  L.marker([40.7128, -74.0060], { icon: customIcon }).addTo(map)
    .bindPopup('Custom Marker at New York');
});
