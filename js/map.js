document.addEventListener("DOMContentLoaded", () => {
  // Global Variables
  let allCountries = [];
  let visitedCountries = JSON.parse(localStorage.getItem("visitedCountries") || "[]");
  let gameActive = false;
  let currentGameCountry = null;
  let geojsonLayer;
  const countryLayers = {}; // Mapping standardized country name → corresponding layer

  // Initialize Map
  const map = L.map("map", { minZoom: 2, tap: true }).setView([20, 0], 2);
  L.tileLayer("https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    noWrap: true,
    maxZoom: 19,
    minZoom: 2,
  }).addTo(map);

  const bounds = L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180));
  map.setMaxBounds(bounds);

  // Marker Toggle Control (with state preservation for game mode)
  let markersEnabled = true;
  let previousMarkersEnabled = markersEnabled;
  const markerToggleControl = L.control({ position: "topright" });
  markerToggleControl.onAdd = function () {
    const div = L.DomUtil.create("div", "leaflet-bar");
    const button = L.DomUtil.create("button", "", div);
    button.innerHTML = "Markers: ON";
    button.style.backgroundColor = "white";
    button.onclick = function (e) {
      e.preventDefault();
      if (gameActive) return;
      markersEnabled = !markersEnabled;
      button.innerHTML = markersEnabled ? "Markers: ON" : "Markers: OFF";
    };
    return div;
  };
  markerToggleControl.addTo(map);

  // Add marker on map click if allowed
  map.on("click", function (e) {
    if (!markersEnabled || gameActive) return;
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(
        `<b>Clicked location:</b><br>Latitude: ${lat.toFixed(4)}<br>Longitude: ${lng.toFixed(4)}`,
        { maxWidth: 300 }
      )
      .openPopup();
  });

  // Update visited countries UI and save to localStorage
  function updateVisitedList() {
    const visitedListElem = document.getElementById("visited-list");
    if (visitedListElem) {
      visitedListElem.innerHTML = visitedCountries.map(c => `<li>${c}</li>`).join("");
    }
    localStorage.setItem("visitedCountries", JSON.stringify(visitedCountries));
  }
  updateVisitedList();

  // Load GeoJSON for countries and create layers
  fetch("countries.geojson")
    .then(response => response.json())
    .then(data => {
      // Populate list of country names
      data.features.forEach(feature => {
        let countryName = standardizeCountryName(feature.properties.name);
        if (!allCountries.includes(countryName)) {
          allCountries.push(countryName);
        }
      });

      // Create GeoJSON layer and attach click events for each country
      geojsonLayer = L.geoJSON(data, {
        style: () => ({ color: "blue", weight: 1, fillOpacity: 0 }),
        onEachFeature: (feature, layer) => {
          let countryName = standardizeCountryName(feature.properties.name);
          countryLayers[countryName] = layer;
          layer.on("click", () => {
            if (gameActive) return;
            geojsonLayer.resetStyle();
            layer.setStyle({ color: "red", weight: 3 });
            if (!visitedCountries.includes(countryName)) {
              visitedCountries.push(countryName);
              updateVisitedList();
            }
            
            // Dispatch custom event for news feature
            const event = new CustomEvent('countrySelected', {
              detail: { country: countryName }
            });
            document.dispatchEvent(event);
            
            const popupContent = `
              <div class="country-popup">
                <h3>${countryName}</h3>
                <button class="toggle-summary" data-country="${countryName}">Show Wikipedia Summary</button>
                <div class="wiki-summary" style="display:none;">Loading summary...</div>
              </div>
            `;
            layer.unbindPopup();
            layer.bindPopup(popupContent, { maxWidth: 300 }).openPopup();
          });
        }
      }).addTo(map);
    })
    .catch(err => console.error("Error loading countries GeoJSON:", err));

  // Fetch Wikipedia summary using async/await for improved error handling
  async function fetchWikipediaSummary(country) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(country)}`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network error");
      const data = await response.json();
      return data.extract || "No summary available.";
    } catch (error) {
      console.error("Error fetching Wikipedia summary:", error);
      return "Error fetching summary.";
    }
  }

  // Standardize country names for consistency
  function standardizeCountryName(country) {
    const countryMap = {
      "United States": "United States",
      "United States of America": "United States",
      "USA": "United States",
      "greatest country ever": "Bulgaria",
      "France": "France",
      "Russian Federation": "Russia",
      "United Kingdom": "United Kingdom",
      "UK": "United Kingdom",
    };
    return countryMap[country] || country;
  }

  // Toggle Wikipedia summary display on popup open
  map.on("popupopen", function (e) {
    const popupNode = e.popup.getElement();
    const button = popupNode.querySelector(".toggle-summary");
    if (button) {
      button.addEventListener("click", async function () {
        const country = button.getAttribute("data-country");
        const summaryDiv = popupNode.querySelector(".wiki-summary");
        if (summaryDiv.style.display === "none") {
          summaryDiv.innerHTML = "Loading summary...";
          const summary = await fetchWikipediaSummary(country);
          summaryDiv.innerHTML = summary;
          summaryDiv.style.display = "block";
          button.textContent = "Hide Wikipedia Summary";
        } else {
          summaryDiv.style.display = "none";
          button.textContent = "Show Wikipedia Summary";
        }
      });
    }
  });

  // ===== GAME FUNCTIONALITY =====
  const gameModal = document.getElementById("gameModal");
  const closeGameModal = document.getElementById("closeGameModal");
  const submitGuessBtn = document.getElementById("submit-guess-btn");
  const newGameBtn = document.getElementById("new-game-btn");
  const gameFeedback = document.getElementById("game-feedback");
  const gameGuessInput = document.getElementById("game-guess");

  const startGameBtn = document.getElementById("startGameBtn");
  startGameBtn.addEventListener("click", () => {
    if (allCountries.length === 0) {
      alert("Countries data is still loading. Please wait.");
      return;
    }
    startGameMode();
  });

  function startGameMode() {
    gameActive = true;
    previousMarkersEnabled = markersEnabled;
    markersEnabled = false;
    gameModal.style.display = "block";
    startNewGame();
  }

  function endGameMode() {
    gameActive = false;
    markersEnabled = previousMarkersEnabled;
    gameModal.style.display = "none";
    if (currentGameCountry && countryLayers[currentGameCountry]) {
      geojsonLayer.resetStyle(countryLayers[currentGameCountry]);
    }
    currentGameCountry = null;
    gameFeedback.textContent = "";
    gameGuessInput.value = "";
  }

  closeGameModal.addEventListener("click", endGameMode);
  window.addEventListener("click", function(e) {
    if (e.target === gameModal) {
      endGameMode();
    }
  });

  function startNewGame() {
    if (currentGameCountry && countryLayers[currentGameCountry]) {
      geojsonLayer.resetStyle(countryLayers[currentGameCountry]);
    }
    const randomIndex = Math.floor(Math.random() * allCountries.length);
    currentGameCountry = allCountries[randomIndex];
    const targetLayer = countryLayers[currentGameCountry];
    if (targetLayer) {
      geojsonLayer.resetStyle();
      targetLayer.setStyle({ color: "green", weight: 4, fillOpacity: 0.2 });
      targetLayer.bringToFront();
    }
    gameFeedback.textContent = "";
    gameGuessInput.value = "";
  }

  submitGuessBtn.addEventListener("click", function() {
    if (!gameActive) return;
    const userGuess = gameGuessInput.value.trim();
    if (userGuess.toLowerCase() === currentGameCountry.toLowerCase()) {
      gameFeedback.textContent = "Correct! Well done.";
      setTimeout(() => {
        startNewGame();
      }, 2000);
    } else {
      gameFeedback.textContent = "Incorrect. Try again!";
    }
  });
  newGameBtn.addEventListener("click", startNewGame);

  // ===== Custom Marker Example =====
  const customIcon = L.icon({
    iconUrl: "images/cars1.jpeg",
    iconSize: [25, 25],
    iconAnchor: [12, 25],
    popupAnchor: [0, -25]
  });
  L.marker([40.7128, -74.0060], { icon: customIcon })
    .addTo(map)
    .bindPopup("Custom Lightning McQueen", { maxWidth: 150 });

  // Clear visited countries event
  const clearVisitedBtn = document.getElementById("clearVisitedBtn");
  clearVisitedBtn.addEventListener("click", function() {
    if (confirm("Are you sure you want to clear your visited countries?")) {
      visitedCountries = [];
      updateVisitedList();
      localStorage.removeItem("visitedCountries");
    }
  });

  // Hide homepage overlay and revalidate map size
  const enterMapBtn = document.getElementById("enterMapBtn");
  if (enterMapBtn) {
    enterMapBtn.addEventListener("click", function() {
      const homepage = document.getElementById("homepage");
      homepage.style.display = "none";
      map.invalidateSize();
    });
  }

  // ===== SEARCH FUNCTIONALITY =====
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query === "") return;
    const foundKey = Object.keys(countryLayers).find(key => key.toLowerCase() === query.toLowerCase());
    if (foundKey) {
      const layer = countryLayers[foundKey];
      const bounds = layer.getBounds();
      map.fitBounds(bounds, { maxZoom: 6 });
      layer.setStyle({ color: "orange", weight: 4 });
      setTimeout(() => {
        geojsonLayer.resetStyle(layer);
      }, 2000);
    } else {
      alert("Country not found. Please check your spelling or try another country.");
    }
  });

  searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      searchBtn.click();
    }
  });
});