// === map.js - Handles map initialization and interactions ===

// Declare L as a global variable, assuming Leaflet is included via a script tag
var L = L || {}

let map
let geojsonLayer
const allCountries = []
let visitedCountries = JSON.parse(localStorage.getItem("visitedCountries") || "[]")
let gameActive = false
let currentGameCountry = null
const countryLayers = {}
let labelLayer = null

// Initialize the map when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initMapApp)

function initMapApp() {
  console.log("Initializing map application")

  // Show loading overlay
  document.getElementById("loadingOverlay").style.display = "flex"

  // Initialize the map with proper settings
  map = L.map("map", {
    minZoom: 2,
    tap: true,
    zoomControl: false,
  }).setView([20, 0], 2)

  // Add zoom control to top-right
  L.control
    .zoom({
      position: "topright",
    })
    .addTo(map)

  // Use CartoDB Voyager map with English labels
  const baseLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
    minZoom: 2,
  }).addTo(map)

  // Add a separate layer for labels that we can toggle
  labelLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
    minZoom: 2,
  })

  const bounds = L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180))
  map.setMaxBounds(bounds)

  function updateVisitedList() {
    const visitedListElem = document.getElementById("visited-list")
    if (visitedListElem) {
      visitedListElem.innerHTML =
        visitedCountries.length > 0
          ? visitedCountries.map((c) => `<li><i class="fas fa-check-circle"></i> ${c}</li>`).join("")
          : "<li class='empty-list'>No countries visited yet</li>"
    }
    localStorage.setItem("visitedCountries", JSON.stringify(visitedCountries))
  }

  function standardizeCountryName(country) {
    const countryMap = {
      "United States": "United States",
      "United States of America": "United States",
      USA: "United States",
      UK: "United Kingdom",
      "Russian Federation": "Russia",
      "South Korea": "Korea, Republic of",
      "North Korea": "Korea, Democratic People's Republic of",
    }
    return countryMap[country] || country
  }

  // Add this function to the map.js file, inside the initMapApp function,
  // right after the standardizeCountryName function

  function correctCountryName(country) {
    const countryCorrections = {
      "Guinea Bissau": "Guinea-Bissau",
      "Democratic Republic of the Congo": "Democratic Republic of Congo",
      "Republic of the Congo": "Republic of Congo",
      "United States": "United States of America",
      "Côte d'Ivoire": "Ivory Coast",
      "Timor-Leste": "East Timor",
      Czechia: "Czech Republic",
      "North Macedonia": "Macedonia",
      Eswatini: "Swaziland",
    }
    return countryCorrections[country] || country
  }

  // Fetch country data for learning mode
  fetch("https://restcountries.com/v3.1/all")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load country data")
      return response.json()
    })
    .then((data) => {
      // Store country data globally for learning mode
      window.countryData = data
      console.log("Country data loaded for learning mode")
    })
    .catch((err) => {
      console.error("Error loading country data:", err)
    })

  // Load GeoJSON data from the file
  fetch("https://raw.githubusercontent.com/kalspas0528/TerraConnect/main/countries.geojson")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load GeoJSON")
      return response.json()
    })
    .then((data) => {
      console.log("GeoJSON loaded successfully")
      data.features.forEach((feature) => {
        const countryName = standardizeCountryName(feature.properties.name)
        if (!allCountries.includes(countryName)) {
          allCountries.push(countryName)
        }
      })

      geojsonLayer = L.geoJSON(data, {
        style: { color: "#3498db", weight: 1, fillOpacity: 0.1 },
        onEachFeature: (feature, layer) => {
          const countryName = standardizeCountryName(feature.properties.name)
          countryLayers[countryName] = layer
          layer.on("click", () => {
            // Skip country selection if marker mode is active or game is active
            if (window.markersEnabled || gameActive) return

            geojsonLayer.resetStyle()
            layer.setStyle({ color: "#e74c3c", weight: 3, fillOpacity: 0.2 })
            if (!visitedCountries.includes(countryName)) {
              visitedCountries.push(countryName)
              updateVisitedList()
            }

            // Dispatch the country selection event
            document.dispatchEvent(
              new CustomEvent("countrySelected", {
                detail: { country: countryName },
              }),
            )

            // Show country info in popup
            showCountryPopup(countryName, layer)
          })
        },
      }).addTo(map)

      // Hide loading overlay once map is ready
      document.getElementById("loadingOverlay").style.display = "none"

      // Update the visited countries list
      updateVisitedList()
    })
    .catch((err) => {
      console.error("Error loading countries GeoJSON:", err)
      document.getElementById("loadingOverlay").style.display = "none"
      alert("Failed to load map data. Please refresh the page.")
    })

  function showCountryPopup(countryName, layer) {
    // Check if Junior Explorer mode is enabled
    if (window.isJuniorExplorerEnabled && window.isJuniorExplorerEnabled()) {
      // Simplified popup for Junior Explorer mode
      const popupContent = `
        <div class="country-popup">
          <h3>${countryName}</h3>
          <div class="country-popup-buttons">
            <button onclick="showCountryInfo('${countryName}')">
              <i class="fas fa-info-circle"></i> Details
            </button>
            <button onclick="openLearnForCountry('${countryName}')">
              <i class="fas fa-graduation-cap"></i> Learn
            </button>
          </div>
        </div>
      `
      layer.unbindPopup()
      layer.bindPopup(popupContent, { maxWidth: 300 }).openPopup()
    } else {
      // Regular popup with news button
      const popupContent = `
        <div class="country-popup">
          <h3>${countryName}</h3>
          <div class="country-popup-buttons">
            <button onclick="showCountryInfo('${countryName}')">
              <i class="fas fa-info-circle"></i> Details
            </button>
            <button onclick="showCountryNews('${countryName}')">
              <i class="fas fa-newspaper"></i> News
            </button>
          </div>
        </div>
      `
      layer.unbindPopup()
      layer.bindPopup(popupContent, { maxWidth: 300 }).openPopup()
    }
  }

  // Add this function to open the learn modal for a specific country
  window.openLearnForCountry = (countryName) => {
    // First close the popup
    map.closePopup()

    // Then open the learn modal
    const learnBtn = document.getElementById("learnModeBtn")
    if (learnBtn) {
      learnBtn.click()

      // Set a global variable to indicate which country to show
      window.learnTargetCountry = countryName
    }
  }

  // Then modify the showCountryInfo function to use this correction
  window.showCountryInfo = async (countryName) => {
    const countryInfoModal = document.getElementById("countryInfoModal")
    const countryInfoTitle = document.getElementById("countryInfoTitle")
    const countryFlag = document.getElementById("countryFlag")
    const countryDetails = document.getElementById("countryDetails")
    const countryWiki = document.getElementById("countryWiki")

    countryInfoTitle.textContent = countryName
    countryDetails.innerHTML = "<p>Loading country details...</p>"
    countryWiki.innerHTML = "Loading Wikipedia summary..."
    countryInfoModal.style.display = "block"

    try {
      // Use the corrected country name for the API
      const correctedName = correctCountryName(countryName)

      // Fetch country details from REST Countries API
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(correctedName)}?fullText=true`,
      )
      const data = await response.json()
      const country = data[0]

      // Set flag
      countryFlag.src = country.flags.png
      countryFlag.alt = `Flag of ${countryName}`

      // Set country details
      const population = country.population.toLocaleString()
      const area = country.area ? country.area.toLocaleString() : "N/A"
      const capital = country.capital ? country.capital.join(", ") : "N/A"
      const region = country.region || "N/A"
      const subregion = country.subregion || "N/A"
      const languages = country.languages ? Object.values(country.languages).join(", ") : "N/A"
      const currencies = country.currencies
        ? Object.values(country.currencies)
            .map((c) => `${c.name} (${c.symbol})`)
            .join(", ")
        : "N/A"

      countryDetails.innerHTML = `
        <p><strong>Capital:</strong> ${capital}</p>
        <p><strong>Population:</strong> ${population}</p>
        <p><strong>Area:</strong> ${area} km²</p>
        <p><strong>Region:</strong> ${region} (${subregion})</p>
        <p><strong>Languages:</strong> ${languages}</p>
        <p><strong>Currencies:</strong> ${currencies}</p>
      `

      // Fetch Wikipedia summary
      const wikiSummary = await fetchWikipediaSummary(countryName)
      countryWiki.textContent = wikiSummary
    } catch (error) {
      console.error("Error fetching country details:", error)
      countryDetails.innerHTML = "<p>Error loading country details. Please try again later.</p>"
      countryWiki.innerHTML = "Error loading Wikipedia summary."
    }
  }

  window.showCountryNews = (countryName) => {
    // Expand news panel and trigger news fetch
    document.querySelector(".news-section").classList.add("expanded")
    document.dispatchEvent(
      new CustomEvent("countrySelected", {
        detail: { country: countryName },
      }),
    )
  }

  async function fetchWikipediaSummary(country) {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(country)}`
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error("Network error")
      const data = await response.json()
      return data.extract || "No summary available."
    } catch (error) {
      console.error("Error fetching Wikipedia summary:", error)
      return "Error fetching summary."
    }
  }

  // Make the map object and layers available globally
  window.map = map
  window.geojsonLayer = geojsonLayer
  window.countryLayers = countryLayers

  // === Game ===
  const gameModal = document.getElementById("gameModal")
  const closeGameModal = document.getElementById("closeGameModal")
  const submitGuessBtn = document.getElementById("submit-guess-btn")
  const newGameBtn = document.getElementById("new-game-btn")
  const gameFeedback = document.getElementById("game-feedback")
  const gameGuessInput = document.getElementById("game-guess")
  const startGameBtn = document.getElementById("startGameBtn")

  // Initialize variables
  let previousMarkersEnabled = false
  const markersEnabled = false
  window.markersEnabled = markersEnabled

  if (startGameBtn) {
    startGameBtn.addEventListener("click", () => {
      if (allCountries.length === 0) {
        alert("Countries data is still loading. Please wait.")
        return
      }
      startGameMode()
    })
  }

  function startGameMode() {
    gameActive = true
    previousMarkersEnabled = window.markersEnabled
    window.markersEnabled = false

    // Update marker toggle button if it exists
    const markerToggleBtn = document.getElementById("markerToggleBtn")
    if (markerToggleBtn) {
      markerToggleBtn.classList.remove("active")
      markerToggleBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Markers'
      markerToggleBtn.style.backgroundColor = ""
      markerToggleBtn.style.color = ""
    }

    // Show game modal
    gameModal.style.display = "block"

    // Remove backdrop filter to prevent blurriness
    document.body.classList.add("game-active")

    // Remove the labels layer to hide country names
    map.removeLayer(baseLayer)
    if (labelLayer) {
      map.removeLayer(labelLayer)
    }

    // Add the no-labels layer
    if (window.noLabelsLayer) {
      window.noLabelsLayer.addTo(map)
    }

    startNewGame()
  }

  function endGameMode() {
    gameActive = false
    window.markersEnabled = previousMarkersEnabled

    // Update marker toggle button if it exists
    const markerToggleBtn = document.getElementById("markerToggleBtn")
    if (markerToggleBtn) {
      if (window.markersEnabled) {
        markerToggleBtn.classList.add("active")
        markerToggleBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Markers On'
        markerToggleBtn.style.backgroundColor = "#3498db"
        markerToggleBtn.style.color = "white"
      }
    }

    gameModal.style.display = "none"

    // Remove game-active class
    document.body.classList.remove("game-active")

    // Restore the normal map layer
    if (window.noLabelsLayer) {
      map.removeLayer(window.noLabelsLayer)
    }

    // Add back the base layer
    baseLayer.addTo(map)

    if (currentGameCountry && countryLayers[currentGameCountry]) {
      geojsonLayer.resetStyle(countryLayers[currentGameCountry])
    }
    currentGameCountry = null
    gameFeedback.textContent = ""
    gameFeedback.className = "feedback"
    gameGuessInput.value = ""

    // Reset the map view to global view
    map.setView([20, 0], 2)
  }

  function startNewGame() {
    if (currentGameCountry && countryLayers[currentGameCountry]) {
      geojsonLayer.resetStyle(countryLayers[currentGameCountry])
    }
    const randomIndex = Math.floor(Math.random() * allCountries.length)
    currentGameCountry = allCountries[randomIndex]
    const targetLayer = countryLayers[currentGameCountry]
    if (targetLayer) {
      geojsonLayer.resetStyle()
      // Change the border color to bright yellow with thicker border for better visibility
      targetLayer.setStyle({ color: "#f1c40f", weight: 6, fillOpacity: 0.2 })
      targetLayer.bringToFront()

      // Center map on the country with limited zoom
      const bounds = targetLayer.getBounds()

      // Calculate appropriate zoom level based on country size
      const countryArea = bounds.getSouthWest().distanceTo(bounds.getNorthEast())
      let zoomLevel = 3 // Default zoom level - zoomed out more

      if (countryArea > 5000000) {
        // Very large country
        zoomLevel = 2
      } else if (countryArea < 500000) {
        // Small country
        zoomLevel = 4
      }

      // Get the center of the country
      const center = bounds.getCenter()

      // Set view with controlled zoom level
      map.setView(center, zoomLevel)
    }
    gameFeedback.textContent = ""
    gameFeedback.className = "feedback"
    gameGuessInput.value = ""
  }

  if (closeGameModal) {
    closeGameModal.addEventListener("click", endGameMode)
  }

  window.addEventListener("click", (e) => {
    if (e.target === gameModal) {
      endGameMode()
    }
  })

  if (submitGuessBtn) {
    submitGuessBtn.addEventListener("click", () => {
      if (!gameActive) return
      const userGuess = gameGuessInput.value.trim()
      if (userGuess.toLowerCase() === currentGameCountry.toLowerCase()) {
        gameFeedback.textContent = "Correct! Well done."
        gameFeedback.className = "feedback success"
        setTimeout(() => {
          startNewGame()
        }, 2000)
      } else {
        gameFeedback.textContent = "Incorrect. Try again!"
        gameFeedback.className = "feedback error"
      }
    })
  }

  if (newGameBtn) {
    newGameBtn.addEventListener("click", startNewGame)
  }

  const clearVisitedBtn = document.getElementById("clearVisitedBtn")
  if (clearVisitedBtn) {
    clearVisitedBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your visited countries?")) {
        visitedCountries = []
        updateVisitedList()
        localStorage.removeItem("visitedCountries")
      }
    })
  }

  const enterMapBtn = document.getElementById("enterMapBtn")
  if (enterMapBtn) {
    enterMapBtn.addEventListener("click", () => {
      console.log("Enter Map button clicked")
      const homepage = document.getElementById("homepage")
      if (homepage) {
        homepage.style.display = "none"
        console.log("Homepage hidden")
      }
      // Force map to recalculate its size after homepage is hidden
      setTimeout(() => {
        if (map && typeof map.invalidateSize === "function") {
          map.invalidateSize()
          console.log("Map size recalculated after entering")
        }
      }, 200)
    })
  }

  // === Search ===
  const searchInput = document.getElementById("searchInput")
  const searchBtn = document.getElementById("searchBtn")

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      const query = searchInput.value.trim()
      if (!query) return
      const foundKey = Object.keys(countryLayers).find((key) => key.toLowerCase() === query.toLowerCase())
      if (foundKey) {
        const layer = countryLayers[foundKey]
        const bounds = layer.getBounds()
        map.fitBounds(bounds, { maxZoom: 6 })
        layer.setStyle({ color: "#f39c12", weight: 4, fillOpacity: 0.3 })
        setTimeout(() => geojsonLayer.resetStyle(layer), 2000)
      } else {
        alert("Country not found. Please check your spelling or try another country.")
      }
    })

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        searchBtn.click()
      }
    })
  }

  // Force map to recalculate its size after it's visible
  setTimeout(() => {
    if (map && typeof map.invalidateSize === "function") {
      map.invalidateSize()
      console.log("Map size recalculated")
    }
  }, 500)

  // Make markersEnabled available globally
  window.markersEnabled = false

  // Add click handler to map for markers
  map.on("click", (e) => {
    if (!window.markersEnabled || gameActive) return

    // Get coordinates
    const { lat, lng } = e.latlng

    // Create a simple popup with just the coordinates
    const popup = L.popup()
      .setLatLng(e.latlng)
      .setContent(`
        <div class="coordinates-popup">
          <p><strong>Coordinates:</strong></p>
          <p>Latitude: ${lat.toFixed(6)}</p>
          <p>Longitude: ${lng.toFixed(6)}</p>
        </div>
      `)
      .openOn(map)

    // Add a marker
    L.marker([lat, lng]).addTo(map)
  })

  // Initialize the no-labels layer for use during the game
  window.noLabelsLayer = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    },
  )
}

// Add marker toggle functionality to the header
document.addEventListener("DOMContentLoaded", () => {
  const headerActions = document.querySelector(".header-actions")
  if (headerActions) {
    const markerToggleBtn = document.createElement("button")
    markerToggleBtn.id = "markerToggleBtn"
    markerToggleBtn.className = "action-button"
    markerToggleBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Markers'

    headerActions.appendChild(markerToggleBtn)

    markerToggleBtn.addEventListener("click", function () {
      window.markersEnabled = !window.markersEnabled
      this.classList.toggle("active")

      if (window.markersEnabled) {
        this.innerHTML = '<i class="fas fa-map-marker-alt"></i> Markers On'
        this.style.backgroundColor = "#3498db"
        this.style.color = "white"
      } else {
        this.innerHTML = '<i class="fas fa-map-marker-alt"></i> Markers'
        this.style.backgroundColor = ""
        this.style.color = ""
      }
    })
  }
})



