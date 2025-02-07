document.addEventListener("DOMContentLoaded", () => {
  const map = L.map("map", { minZoom: 2, tap: true }).setView([20, 0], 2);

  L.tileLayer("https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    noWrap: true,
    maxZoom: 19,
    minZoom: 2,
  }).addTo(map);

  const bounds = L.latLngBounds(
    L.latLng(-85, -180),
    L.latLng(85, 180)
  );
  map.setMaxBounds(bounds);

  let markersEnabled = true;
  const markerToggleControl = L.control({ position: "topright" });

  markerToggleControl.onAdd = function () {
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

  map.on("click", function (e) {
    if (!markersEnabled) return;
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    L.marker([lat, lng]).addTo(map)
      .bindPopup(`<b>Clicked location:</b><br>Latitude: ${lat.toFixed(4)}<br>Longitude: ${lng.toFixed(4)}`)
      .openPopup();
  });

  fetch("countries.geojson")
    .then(response => response.json())
    .then(data => {
      const geojsonLayer = L.geoJSON(data, {
        style: function () {
          return { color: "blue", weight: 1, fillOpacity: 0 };
        },
        onEachFeature: function (feature, layer) {
          layer.on("click", function () {
            geojsonLayer.resetStyle();
            layer.setStyle({ color: "red", weight: 3 });

            let countryName = feature.properties.name;
            countryName = standardizeCountryName(countryName); // Fix for USA, France, etc.

            const popupContent = `
              <div class="country-popup">
                <h3>${countryName}</h3>
                <button class="toggle-summary" data-country="${countryName}">Show Wikipedia Summary</button>
                <div class="wiki-summary" style="display:none;">Loading summary...</div>
              </div>
            `;

            layer.bindPopup(popupContent).openPopup();
          });
        }
      }).addTo(map);
    })
    .catch(err => console.error("Error loading countries GeoJSON:", err));

  function fetchWikipediaSummary(country) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(country)}`;
    return fetch(url)
      .then(response => response.json())
      .then(data => data.extract || "No summary available.")
      .catch(() => "Error fetching summary.");
  }

  function standardizeCountryName(country) {
    const countryMap = {
      "United States": "United States",
      "United States of America": "United States",
      "USA": "United States",
      "France": "France",
      "Russian Federation": "Russia",
      "United Kingdom": "United Kingdom",
      "UK": "United Kingdom",
    };
    return countryMap[country] || country;
  }

  map.on("popupopen", function (e) {
    const popupNode = e.popup.getElement();
    const button = popupNode.querySelector(".toggle-summary");
    if (button) {
      button.addEventListener("click", function () {
        const country = button.getAttribute("data-country");
        const summaryDiv = popupNode.querySelector(".wiki-summary");
        if (summaryDiv.style.display === "none") {
          fetchWikipediaSummary(country).then(summary => {
            summaryDiv.innerHTML = summary;
            summaryDiv.style.display = "block";
            button.textContent = "Hide Wikipedia Summary";
          });
        } else {
          summaryDiv.style.display = "none";
          button.textContent = "Show Wikipedia Summary";
        }
      });
    }
  });

  const customIcon = L.icon({
    iconUrl: "images/cars1.jpeg",
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25]
  });
  L.marker([40.7128, -74.0060], { icon: customIcon }).addTo(map)
    .bindPopup("Custom Marker at New York");
});
