document.addEventListener("DOMContentLoaded", () => {
  const map = L.map("map").setView([0, 0], 2);

  // Tile layer with noWrap to prevent map from showing edges
  L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      noWrap: true, // Prevent wrapping of the map tiles
  }).addTo(map);

  // Add zoom controls
  L.control.zoom().addTo(map);

  // Add click event to place marker and show coordinates
  map.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    
    L.marker([lat, lng]).addTo(map)
      .bindPopup("<b>Clicked location:</b><br>Latitude: " + lat + "<br>Longitude: " + lng)
      .openPopup();
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
