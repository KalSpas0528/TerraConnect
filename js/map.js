document.addEventListener("DOMContentLoaded", () => {
  // Initialize the map with minimum zoom and tap support
  const map = L.map("map", { minZoom: 2, tap: true }).setView([20, 0], 2);

  // Use CartoDB Positron tiles for English-only labels
  L.tileLayer("https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    noWrap: true,
    maxZoom: 19,
    minZoom: 2,
  }).addTo(map);

  // Set maximum bounds to restrict panning outside the world
  const bounds = L.latLngBounds(
    L.latLng(-85, -180),
    L.latLng(85, 180)
  );
  map.setMaxBounds(bounds);

  // Variable to toggle marker creation
  let markersEnabled = true;

  // Custom control to toggle marker creation
  const markerToggleControl = L.control({ position: "topright" });
  markerToggleControl.onAdd = function (map) {
    const div = L.DomUtil.create("div", "leaflet-bar");
    const button = L.DomUtil.create("button", "", div);
    button.innerHTML = "Markers: ON";
    button.style.backgroundColor = "white";
    button.onclick = function (e) {
      e.preventDefault();
      markersEnabled = !markersEnabled;
      button.innerHTML = markersEnabled ? "Markers: ON" : "Markers: OFF";
    };
    return div;
  };
  markerToggleControl.addTo(map);

  // Add click event to the map for marker creation (if enabled)
  map.on("click", function (e) {
    if (!markersEnabled) return;
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    L.marker([lat, lng]).addTo(map)
      .bindPopup(`<b>Clicked location:</b><br>Latitude: ${lat.toFixed(4)}<br>Longitude: ${lng.toFixed(4)}`)
      .openPopup();
  });

  // Load GeoJSON for countries (ensure your countries.geojson is valid and in the correct folder)
  fetch("countries.geojson")
    .then(response => response.json())
    .then(data => {
      const geojsonLayer = L.geoJSON(data, {
        style: function (feature) {
          return {
            color: "blue",
            weight: 1,
            fillOpacity: 0
          };
        },
        onEachFeature: function (feature, layer) {
          // Add a click event to highlight the country and open a custom popup
          layer.on("click", function(e) {
            // Reset style for all countries
            geojsonLayer.resetStyle();
            // Highlight the clicked country
            layer.setStyle({
              color: "red",
              weight: 3
            });

            // Get the country name from the feature properties
            const countryName = feature.properties.name;

            // Build popup content with a toggle button for the Wikipedia summary
            const popupContent = `
              <div class="country-popup">
                <h3>${countryName}</h3>
                <button class="toggle-summary" data-country="${countryName}">Show Wikipedia Summary</button>
                <div class="wiki-summary" style="display:none;">Loading summary...</div>
              </div>
            `;

            // Bind the popup to the layer and open it
            layer.bindPopup(popupContent).openPopup();
          });
        }
      }).addTo(map);
    })
    .catch(err => console.error("Error loading countries GeoJSON:", err));

  // Function to fetch the Wikipedia summary for a given country
  function fetchWikipediaSummary(country) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(country)}`;
    return fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.extract) {
          return data.extract;
        } else {
          return "No summary available.";
        }
      })
      .catch(error => {
        console.error("Error fetching Wikipedia summary:", error);
        return "Error fetching summary.";
      });
  }

  // Listen for the popupopen event to attach the toggle functionality
  map.on("popupopen", function(e) {
    const popupNode = e.popup.getElement();
    const button = popupNode.querySelector(".toggle-summary");
    if (button) {
      button.addEventListener("click", function() {
        const country = button.getAttribute("data-country");
        const summaryDiv = popupNode.querySelector(".wiki-summary");
        if (summaryDiv.style.display === "none") {
          // Fetch and display the Wikipedia summary
          fetchWikipediaSummary(country).then(summary => {
            summaryDiv.innerHTML = summary;
            summaryDiv.style.display = "block";
            button.textContent = "Hide Wikipedia Summary";
          });
        } else {
          // Hide the summary
          summaryDiv.style.display = "none";
          button.textContent = "Show Wikipedia Summary";
        }
      });
    }
  });

  // Example: Adding a custom icon marker (optional)
  const customIcon = L.icon({
    iconUrl: "images/cars1.jpeg", // Replace with your custom icon URL
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25]
  });
  L.marker([40.7128, -74.0060], { icon: customIcon }).addTo(map)
    .bindPopup("Custom Marker at New York");
});
