// === map.js - Handles map initialization and interactions ===

let map
let geojsonLayer
const allCountries = []
let visitedCountries = JSON.parse(localStorage.getItem("visitedCountries") || "[]")
let gameActive = false
let currentGameCountry = null
const countryLayers = {}

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

  // Use OpenStreetMap tiles instead of CartoDB (which was giving 400 errors)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    minZoom: 2,
  }).addTo(map)

  const bounds = L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180))
  map.setMaxBounds(bounds)

  // === Marker Toggle Control ===
  let markersEnabled = false
  let previousMarkersEnabled = false
  const markerToggleControl = L.control({ position: "topright" })
  markerToggleControl.onAdd = () => {
    const div = L.DomUtil.create("div", "leaflet-bar custom-map-control")
    const button = L.DomUtil.create("a", "", div)
    button.innerHTML = '<i class="fas fa-map-marker-alt"></i>'
    button.title = "Toggle Markers"
    button.href = "#"
    button.style.fontSize = "16px"
    button.onclick = (e) => {
      e.preventDefault()
      if (gameActive) return
      markersEnabled = !markersEnabled
      button.innerHTML = markersEnabled ? '<i class="fas fa-map-marker-alt"></i>' : '<i class="fas fa-ban"></i>'
      button.title = markersEnabled ? "Disable Markers" : "Enable Markers"
    }
    return div
  }
  markerToggleControl.addTo(map)

  map.on("click", (e) => {
    if (!markersEnabled || gameActive) return
    const { lat, lng } = e.latlng
    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`<b>Clicked location:</b><br>Latitude: ${lat.toFixed(4)}<br>Longitude: ${lng.toFixed(4)}`)
      .openPopup()
  })

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
            if (gameActive) return
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

  // Make these functions available globally
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
      // Fetch country details from REST Countries API
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`,
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

  // === Game ===
  const gameModal = document.getElementById("gameModal")
  const closeGameModal = document.getElementById("closeGameModal")
  const submitGuessBtn = document.getElementById("submit-guess-btn")
  const newGameBtn = document.getElementById("new-game-btn")
  const gameFeedback = document.getElementById("game-feedback")
  const gameGuessInput = document.getElementById("game-guess")
  const startGameBtn = document.getElementById("startGameBtn")

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
    previousMarkersEnabled = markersEnabled
    markersEnabled = false
    gameModal.style.display = "block"
    startNewGame()
  }

  function endGameMode() {
    gameActive = false
    markersEnabled = previousMarkersEnabled
    gameModal.style.display = "none"
    if (currentGameCountry && countryLayers[currentGameCountry]) {
      geojsonLayer.resetStyle(countryLayers[currentGameCountry])
    }
    currentGameCountry = null
    gameFeedback.textContent = ""
    gameFeedback.className = "feedback"
    gameGuessInput.value = ""
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
      targetLayer.setStyle({ color: "#2ecc71", weight: 4, fillOpacity: 0.3 })
      targetLayer.bringToFront()

      // Center map on the country
      map.fitBounds(targetLayer.getBounds(), { padding: [50, 50] })
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
        map.invalidateSize()
        console.log("Map size recalculated after entering")
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
    map.invalidateSize()
    console.log("Map size recalculated")
  }, 500)
}