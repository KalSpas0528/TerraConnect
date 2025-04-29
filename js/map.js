// === map.js (Fixed & Improved) ===

function initMapApp() {
  const allCountries = []
  let visitedCountries = JSON.parse(localStorage.getItem("visitedCountries") || "[]")
  let gameActive = false
  let currentGameCountry = null
  let geojsonLayer
  const countryLayers = {}

  // Initialize the map with proper settings
  const map = L.map("map", { minZoom: 2, tap: true }).setView([20, 0], 2)
  L.tileLayer("https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
    noWrap: true,
    maxZoom: 19,
    minZoom: 2,
  }).addTo(map)

  const bounds = L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180))
  map.setMaxBounds(bounds)

  // === Marker Toggle Control ===
  let markersEnabled = true
  let previousMarkersEnabled = true
  const markerToggleControl = L.control({ position: "topright" })
  markerToggleControl.onAdd = () => {
    const div = L.DomUtil.create("div", "leaflet-bar")
    const button = L.DomUtil.create("button", "", div)
    button.innerHTML = "Markers: ON"
    button.style.backgroundColor = "white"
    button.onclick = (e) => {
      e.preventDefault()
      if (gameActive) return
      markersEnabled = !markersEnabled
      button.innerHTML = markersEnabled ? "Markers: ON" : "Markers: OFF"
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
      visitedListElem.innerHTML = visitedCountries.map((c) => `<li>${c}</li>`).join("")
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
      "greatest country ever": "Bulgaria",
      "South Korea": "Korea, Republic of",
      "North Korea": "Korea, Democratic People's Republic of",
    }
    return countryMap[country] || country
  }

  // Load GeoJSON data from the file
  fetch("countries.geojson")
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
        style: { color: "blue", weight: 1, fillOpacity: 0.1 },
        onEachFeature: (feature, layer) => {
          const countryName = standardizeCountryName(feature.properties.name)
          countryLayers[countryName] = layer
          layer.on("click", () => {
            if (gameActive) return
            geojsonLayer.resetStyle()
            layer.setStyle({ color: "red", weight: 3 })
            if (!visitedCountries.includes(countryName)) {
              visitedCountries.push(countryName)
              updateVisitedList()
            }
            document.dispatchEvent(
              new CustomEvent("countrySelected", {
                detail: { country: countryName },
              }),
            )
            const popupContent = `
              <div class="country-popup">
                <h3>${countryName}</h3>
                <button class="toggle-summary" data-country="${countryName}">Show Wikipedia Summary</button>
                <div class="wiki-summary" style="display:none;">Loading summary...</div>
              </div>
            `
            layer.unbindPopup()
            layer.bindPopup(popupContent, { maxWidth: 300 }).openPopup()
          })
        },
      }).addTo(map)
    })
    .catch((err) => console.error("Error loading countries GeoJSON:", err))

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

  map.on("popupopen", (e) => {
    const popupNode = e.popup.getElement()
    const button = popupNode.querySelector(".toggle-summary")
    if (button) {
      button.addEventListener("click", async () => {
        const country = button.getAttribute("data-country")
        const summaryDiv = popupNode.querySelector(".wiki-summary")
        if (summaryDiv.style.display === "none") {
          summaryDiv.innerHTML = "Loading summary..."
          const summary = await fetchWikipediaSummary(country)
          summaryDiv.innerHTML = summary
          summaryDiv.style.display = "block"
          button.textContent = "Hide Wikipedia Summary"
        } else {
          summaryDiv.style.display = "none"
          button.textContent = "Show Wikipedia Summary"
        }
      })
    }
  })

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
      targetLayer.setStyle({ color: "green", weight: 4, fillOpacity: 0.2 })
      targetLayer.bringToFront()
    }
    gameFeedback.textContent = ""
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
        setTimeout(() => {
          startNewGame()
        }, 2000)
      } else {
        gameFeedback.textContent = "Incorrect. Try again!"
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
      const homepage = document.getElementById("homepage")
      homepage.style.display = "none"
      map.invalidateSize()
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
        layer.setStyle({ color: "orange", weight: 4 })
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

// Initialize the map when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initMapApp)
