///*map.js 
//// === map.js - Handles map initialization and interactions ===
//
//let map
//let geojsonLayer
//const allCountries = []
//let visitedCountries = JSON.parse(localStorage.getItem("visitedCountries") || "[]")
//let gameActive = false
//let currentGameCountry = null
//const countryLayers = {}
//
//// Initialize the map when the DOM is fully loaded
//document.addEventListener("DOMContentLoaded", initMapApp)
//
//function initMapApp() {
//  console.log("Initializing map application")
//
//  // Show loading overlay
//  document.getElementById("loadingOverlay").style.display = "flex"
//
//  // Initialize the map with proper settings
//  map = L.map("map", {
//    minZoom: 2,
//    tap: true,
//    zoomControl: false,
//  }).setView([20, 0], 2)
//
//  // Add zoom control to top-right
//  L.control
//    .zoom({
//      position: "topright",
//    })
//    .addTo(map)
//
//  // Use OpenStreetMap tiles instead of CartoDB (which was giving 400 errors)
//  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//    maxZoom: 19,
//    minZoom: 2,
//  }).addTo(map)
//
//  const bounds = L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180))
//  map.setMaxBounds(bounds)
//
//  // === Marker Toggle Control ===
//  let markersEnabled = false
//  let previousMarkersEnabled = false
//  const markerToggleControl = L.control({ position: "topright" })
//  markerToggleControl.onAdd = () => {
//    const div = L.DomUtil.create("div", "leaflet-bar custom-map-control")
//    const button = L.DomUtil.create("a", "", div)
//    button.innerHTML = '<i class="fas fa-map-marker-alt"></i>'
//    button.title = "Toggle Markers"
//    button.href = "#"
//    button.style.fontSize = "16px"
//    button.onclick = (e) => {
//      e.preventDefault()
//      if (gameActive) return
//      markersEnabled = !markersEnabled
//      button.innerHTML = markersEnabled ? '<i class="fas fa-map-marker-alt"></i>' : '<i class="fas fa-ban"></i>'
//      button.title = markersEnabled ? "Disable Markers" : "Enable Markers"
//    }
//    return div
//  }
//  markerToggleControl.addTo(map)
//
//  map.on("click", (e) => {
//    if (!markersEnabled || gameActive) return
//    const { lat, lng } = e.latlng
//    L.marker([lat, lng])
//      .addTo(map)
//      .bindPopup(`<b>Clicked location:</b><br>Latitude: ${lat.toFixed(4)}<br>Longitude: ${lng.toFixed(4)}`)
//      .openPopup()
//  })
//
//  function updateVisitedList() {
//    const visitedListElem = document.getElementById("visited-list")
//    if (visitedListElem) {
//      visitedListElem.innerHTML =
//        visitedCountries.length > 0
//          ? visitedCountries.map((c) => `<li><i class="fas fa-check-circle"></i> ${c}</li>`).join("")
//          : "<li class='empty-list'>No countries visited yet</li>"
//    }
//    localStorage.setItem("visitedCountries", JSON.stringify(visitedCountries))
//  }
//
//  function standardizeCountryName(country) {
//    const countryMap = {
//      "United States": "United States",
//      "United States of America": "United States",
//      USA: "United States",
//      UK: "United Kingdom",
//      "Russian Federation": "Russia",
//      "South Korea": "Korea, Republic of",
//      "North Korea": "Korea, Democratic People's Republic of",
//    }
//    return countryMap[country] || country
//  }
//
//  // Load GeoJSON data from the file
//  fetch("https://raw.githubusercontent.com/kalspas0528/TerraConnect/main/countries.geojson")
//    .then((response) => {
//      if (!response.ok) throw new Error("Failed to load GeoJSON")
//      return response.json()
//    })
//    .then((data) => {
//      console.log("GeoJSON loaded successfully")
//      data.features.forEach((feature) => {
//        const countryName = standardizeCountryName(feature.properties.name)
//        if (!allCountries.includes(countryName)) {
//          allCountries.push(countryName)
//        }
//      })
//
//      geojsonLayer = L.geoJSON(data, {
//        style: { color: "#3498db", weight: 1, fillOpacity: 0.1 },
//        onEachFeature: (feature, layer) => {
//          const countryName = standardizeCountryName(feature.properties.name)
//          countryLayers[countryName] = layer
//          layer.on("click", () => {
//            if (gameActive) return
//            geojsonLayer.resetStyle()
//            layer.setStyle({ color: "#e74c3c", weight: 3, fillOpacity: 0.2 })
//            if (!visitedCountries.includes(countryName)) {
//              visitedCountries.push(countryName)
//              updateVisitedList()
//            }
//
//            // Dispatch the country selection event
//            document.dispatchEvent(
//              new CustomEvent("countrySelected", {
//                detail: { country: countryName },
//              }),
//            )
//
//            // Show country info in popup
//            showCountryPopup(countryName, layer)
//          })
//        },
//      }).addTo(map)
//
//      // Hide loading overlay once map is ready
//      document.getElementById("loadingOverlay").style.display = "none"
//
//      // Update the visited countries list
//      updateVisitedList()
//    })
//    .catch((err) => {
//      console.error("Error loading countries GeoJSON:", err)
//      document.getElementById("loadingOverlay").style.display = "none"
//      alert("Failed to load map data. Please refresh the page.")
//    })
//
//  function showCountryPopup(countryName, layer) {
//    const popupContent = `
//            <div class="country-popup">
//                <h3>${countryName}</h3>
//                <div class="country-popup-buttons">
//                    <button onclick="showCountryInfo('${countryName}')">
//                        <i class="fas fa-info-circle"></i> Details
//                    </button>
//                    <button onclick="showCountryNews('${countryName}')">
//                        <i class="fas fa-newspaper"></i> News
//                    </button>
//                </div>
//            </div>
//        `
//    layer.unbindPopup()
//    layer.bindPopup(popupContent, { maxWidth: 300 }).openPopup()
//  }
//
//  // Make these functions available globally
//  window.showCountryInfo = async (countryName) => {
//    const countryInfoModal = document.getElementById("countryInfoModal")
//    const countryInfoTitle = document.getElementById("countryInfoTitle")
//    const countryFlag = document.getElementById("countryFlag")
//    const countryDetails = document.getElementById("countryDetails")
//    const countryWiki = document.getElementById("countryWiki")
//
//    countryInfoTitle.textContent = countryName
//    countryDetails.innerHTML = "<p>Loading country details...</p>"
//    countryWiki.innerHTML = "Loading Wikipedia summary..."
//    countryInfoModal.style.display = "block"
//
//    try {
//      // Fetch country details from REST Countries API
//      const response = await fetch(
//        `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`,
//      )
//      const data = await response.json()
//      const country = data[0]
//
//      // Set flag
//      countryFlag.src = country.flags.png
//      countryFlag.alt = `Flag of ${countryName}`
//
//      // Set country details
//      const population = country.population.toLocaleString()
//      const area = country.area ? country.area.toLocaleString() : "N/A"
//      const capital = country.capital ? country.capital.join(", ") : "N/A"
//      const region = country.region || "N/A"
//      const subregion = country.subregion || "N/A"
//      const languages = country.languages ? Object.values(country.languages).join(", ") : "N/A"
//      const currencies = country.currencies
//        ? Object.values(country.currencies)
//            .map((c) => `${c.name} (${c.symbol})`)
//            .join(", ")
//        : "N/A"
//
//      countryDetails.innerHTML = `
//                <p><strong>Capital:</strong> ${capital}</p>
//                <p><strong>Population:</strong> ${population}</p>
//                <p><strong>Area:</strong> ${area} km²</p>
//                <p><strong>Region:</strong> ${region} (${subregion})</p>
//                <p><strong>Languages:</strong> ${languages}</p>
//                <p><strong>Currencies:</strong> ${currencies}</p>
//            `
//
//      // Fetch Wikipedia summary
//      const wikiSummary = await fetchWikipediaSummary(countryName)
//      countryWiki.textContent = wikiSummary
//    } catch (error) {
//      console.error("Error fetching country details:", error)
//      countryDetails.innerHTML = "<p>Error loading country details. Please try again later.</p>"
//      countryWiki.innerHTML = "Error loading Wikipedia summary."
//    }
//  }
//
//  window.showCountryNews = (countryName) => {
//    // Expand news panel and trigger news fetch
//    document.querySelector(".news-section").classList.add("expanded")
//    document.dispatchEvent(
//      new CustomEvent("countrySelected", {
//        detail: { country: countryName },
//      }),
//    )
//  }
//
//  async function fetchWikipediaSummary(country) {
//    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(country)}`
//    try {
//      const response = await fetch(url)
//      if (!response.ok) throw new Error("Network error")
//      const data = await response.json()
//      return data.extract || "No summary available."
//    } catch (error) {
//      console.error("Error fetching Wikipedia summary:", error)
//      return "Error fetching summary."
//    }
//  }
//
//  // === Game ===
//  const gameModal = document.getElementById("gameModal")
//  const closeGameModal = document.getElementById("closeGameModal")
//  const submitGuessBtn = document.getElementById("submit-guess-btn")
//  const newGameBtn = document.getElementById("new-game-btn")
//  const gameFeedback = document.getElementById("game-feedback")
//  const gameGuessInput = document.getElementById("game-guess")
//  const startGameBtn = document.getElementById("startGameBtn")
//
//  if (startGameBtn) {
//    startGameBtn.addEventListener("click", () => {
//      if (allCountries.length === 0) {
//        alert("Countries data is still loading. Please wait.")
//        return
//      }
//      startGameMode()
//    })
//  }
//
//  function startGameMode() {
//    gameActive = true
//    previousMarkersEnabled = markersEnabled
//    markersEnabled = false
//    gameModal.style.display = "block"
//    startNewGame()
//  }
//
//  function endGameMode() {
//    gameActive = false
//    markersEnabled = previousMarkersEnabled
//    gameModal.style.display = "none"
//    if (currentGameCountry && countryLayers[currentGameCountry]) {
//      geojsonLayer.resetStyle(countryLayers[currentGameCountry])
//    }
//    currentGameCountry = null
//    gameFeedback.textContent = ""
//    gameFeedback.className = "feedback"
//    gameGuessInput.value = ""
//  }
//
//  function startNewGame() {
//    if (currentGameCountry && countryLayers[currentGameCountry]) {
//      geojsonLayer.resetStyle(countryLayers[currentGameCountry])
//    }
//    const randomIndex = Math.floor(Math.random() * allCountries.length)
//    currentGameCountry = allCountries[randomIndex]
//    const targetLayer = countryLayers[currentGameCountry]
//    if (targetLayer) {
//      geojsonLayer.resetStyle()
//      targetLayer.setStyle({ color: "#2ecc71", weight: 4, fillOpacity: 0.3 })
//      targetLayer.bringToFront()
//
//      // Center map on the country
//      map.fitBounds(targetLayer.getBounds(), { padding: [50, 50] })
//    }
//    gameFeedback.textContent = ""
//    gameFeedback.className = "feedback"
//    gameGuessInput.value = ""
//  }
//
//  if (closeGameModal) {
//    closeGameModal.addEventListener("click", endGameMode)
//  }
//
//  window.addEventListener("click", (e) => {
//    if (e.target === gameModal) {
//      endGameMode()
//    }
//  })
//
//  if (submitGuessBtn) {
//    submitGuessBtn.addEventListener("click", () => {
//      if (!gameActive) return
//      const userGuess = gameGuessInput.value.trim()
//      if (userGuess.toLowerCase() === currentGameCountry.toLowerCase()) {
//        gameFeedback.textContent = "Correct! Well done."
//        gameFeedback.className = "feedback success"
//        setTimeout(() => {
//          startNewGame()
//        }, 2000)
//      } else {
//        gameFeedback.textContent = "Incorrect. Try again!"
//        gameFeedback.className = "feedback error"
//      }
//    })
//  }
//
//  if (newGameBtn) {
//    newGameBtn.addEventListener("click", startNewGame)
//  }
//
//  const clearVisitedBtn = document.getElementById("clearVisitedBtn")
//  if (clearVisitedBtn) {
//    clearVisitedBtn.addEventListener("click", () => {
//      if (confirm("Are you sure you want to clear your visited countries?")) {
//        visitedCountries = []
//        updateVisitedList()
//        localStorage.removeItem("visitedCountries")
//      }
//    })
//  }
//
//  const enterMapBtn = document.getElementById("enterMapBtn")
//  if (enterMapBtn) {
//    enterMapBtn.addEventListener("click", () => {
//      console.log("Enter Map button clicked")
//      const homepage = document.getElementById("homepage")
//      if (homepage) {
//        homepage.style.display = "none"
//        console.log("Homepage hidden")
//      }
//      // Force map to recalculate its size after homepage is hidden
//      setTimeout(() => {
//        map.invalidateSize()
//        console.log("Map size recalculated after entering")
//      }, 200)
//    })
//  }
//
//  // === Search ===
//  const searchInput = document.getElementById("searchInput")
//  const searchBtn = document.getElementById("searchBtn")
//
//  if (searchBtn && searchInput) {
//    searchBtn.addEventListener("click", () => {
//      const query = searchInput.value.trim()
//      if (!query) return
//      const foundKey = Object.keys(countryLayers).find((key) => key.toLowerCase() === query.toLowerCase())
//      if (foundKey) {
//        const layer = countryLayers[foundKey]
//        const bounds = layer.getBounds()
//        map.fitBounds(bounds, { maxZoom: 6 })
//        layer.setStyle({ color: "#f39c12", weight: 4, fillOpacity: 0.3 })
//        setTimeout(() => geojsonLayer.resetStyle(layer), 2000)
//      } else {
//        alert("Country not found. Please check your spelling or try another country.")
//      }
//    })
//
//    searchInput.addEventListener("keydown", (e) => {
//      if (e.key === "Enter") {
//        searchBtn.click()
//      }
//    })
//  }
//
//  // Force map to recalculate its size after it's visible
//  setTimeout(() => {
//    map.invalidateSize()
//    console.log("Map size recalculated")
//  }, 500)
//}
//
//
//ui.js"// === ui.js - Handles UI interactions and general app behavior ===
//
//document.addEventListener("DOMContentLoaded", initUI)
//
//function initUI() {
//  // Initialize sidebar toggle
//  const sidebarToggle = document.getElementById("sidebarToggle")
//  const sidebar = document.querySelector(".sidebar")
//
//  if (sidebarToggle && sidebar) {
//    sidebarToggle.addEventListener("click", () => {
//      sidebar.classList.toggle("expanded")
//      sidebarToggle.innerHTML = sidebar.classList.contains("expanded")
//        ? '<i class="fas fa-chevron-left"></i>'
//        : '<i class="fas fa-chevron-right"></i>'
//    })
//
//    // Expand sidebar by default
//    sidebar.classList.add("expanded")
//    sidebarToggle.innerHTML = '<i class="fas fa-chevron-left"></i>'
//  }
//
//  // Initialize country info modal close button
//  const closeCountryInfoModal = document.getElementById("closeCountryInfoModal")
//  const countryInfoModal = document.getElementById("countryInfoModal")
//
//  if (closeCountryInfoModal && countryInfoModal) {
//    closeCountryInfoModal.addEventListener("click", () => {
//      countryInfoModal.style.display = "none"
//    })
//
//    window.addEventListener("click", (e) => {
//      if (e.target === countryInfoModal) {
//        countryInfoModal.style.display = "none"
//      }
//    })
//  }
//
//  // Handle Enter key in game input
//  const gameGuessInput = document.getElementById("game-guess")
//  const submitGuessBtn = document.getElementById("submit-guess-btn")
//
//  if (gameGuessInput && submitGuessBtn) {
//    gameGuessInput.addEventListener("keydown", (e) => {
//      if (e.key === "Enter") {
//        submitGuessBtn.click()
//      }
//    })
//  }
//
//  // Add keyboard shortcuts
//  document.addEventListener("keydown", (e) => {
//    // Escape key closes modals
//    if (e.key === "Escape") {
//      const modals = document.querySelectorAll(".modal")
//      modals.forEach((modal) => {
//        if (modal.style.display === "block") {
//          modal.style.display = "none"
//        }
//      })
//    }
//
//    // S key toggles sidebar
//    if (e.key === "s" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
//      if (sidebar) {
//        sidebar.classList.toggle("expanded")
//        if (sidebarToggle) {
//          sidebarToggle.innerHTML = sidebar.classList.contains("expanded")
//            ? '<i class="fas fa-chevron-left"></i>'
//            : '<i class="fas fa-chevron-right"></i>'
//        }
//      }
//    }
//
//    // N key toggles news panel
//    if (e.key === "n" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
//      const newsSection = document.querySelector(".news-section")
//      const newsToggle = document.getElementById("newsToggle")
//
//      if (newsSection) {
//        newsSection.classList.toggle("expanded")
//        if (newsToggle) {
//          newsToggle.innerHTML = newsSection.classList.contains("expanded")
//            ? '<i class="fas fa-chevron-right"></i>'
//            : '<i class="fas fa-chevron-left"></i>'
//        }
//      }
//    }
//  })
//
//  // Handle Enter Map button
//  const enterMapBtn = document.getElementById("enterMapBtn")
//  const homepage = document.getElementById("homepage")
//
//  if (enterMapBtn && homepage) {
//    enterMapBtn.addEventListener("click", () => {
//      homepage.style.display = "none"
//
//      // Force map to recalculate its size
//      if (window.map) {
//        setTimeout(() => {
//          window.map.invalidateSize()
//        }, 200)
//      }
//    })
//  }
//}
//"
//comparison.js"// === comparison.js - Handles country comparison functionality ===
//
//document.addEventListener("DOMContentLoaded", initComparisonFeature)
//
//function initComparisonFeature() {
//  const comparisonModal = document.getElementById("comparisonModal")
//  const closeComparisonModal = document.getElementById("closeComparisonModal")
//  const compareBtn = document.getElementById("compareBtn")
//  const country1Select = document.getElementById("country1")
//  const country2Select = document.getElementById("country2")
//  const comparisonResults = document.getElementById("comparisonResults")
//  const compareCountriesBtn = document.getElementById("compareCountriesBtn")
//
//  if (!comparisonModal) {
//    console.error("Comparison modal not found.")
//    return
//  }
//  if (!compareCountriesBtn) {
//    console.error("Compare Countries button not found.")
//    return
//  }
//
//  // Open the comparison modal when the button is clicked
//  function openComparisonModal() {
//    comparisonModal.style.display = "block"
//  }
//
//  compareCountriesBtn.addEventListener("click", openComparisonModal)
//
//  // Close the modal when the close button is clicked
//  if (closeComparisonModal) {
//    closeComparisonModal.addEventListener("click", () => {
//      comparisonModal.style.display = "none"
//    })
//  }
//
//  // Close the modal when clicking outside of it
//  window.addEventListener("click", (e) => {
//    if (e.target === comparisonModal) {
//      comparisonModal.style.display = "none"
//    }
//  })
//
//  // Populate dropdowns with country names from the Rest Countries API
//  async function populateComparisonDropdowns() {
//    try {
//      const response = await fetch("https://restcountries.com/v3.1/all")
//      const data = await response.json()
//      const countryNames = data.map((country) => country.name.common).sort()
//
//      countryNames.forEach((country) => {
//        const option1 = document.createElement("option")
//        option1.value = country
//        option1.textContent = country
//        country1Select.appendChild(option1)
//
//        const option2 = document.createElement("option")
//        option2.value = country
//        option2.textContent = country
//        country2Select.appendChild(option2)
//      })
//    } catch (error) {
//      console.error("Error fetching country list:", error)
//      comparisonResults.innerHTML = `
//                <div class="comparison-error">
//                    <p>Error loading country list. Please try again later.</p>
//                </div>
//            `
//    }
//  }
//
//  // Fetch details for a given country using the Rest Countries API
//  async function fetchCountryDetails(countryName) {
//    try {
//      const response = await fetch(
//        `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`,
//      )
//      const data = await response.json()
//      return data[0]
//    } catch (error) {
//      console.error(`Error fetching details for ${countryName}:`, error)
//      return null
//    }
//  }
//
//  // Compare the two selected countries and display the results
//  async function compareCountries() {
//    const country1 = country1Select.value
//    const country2 = country2Select.value
//
//    if (!country1 || !country2) {
//      alert("Please select both countries.")
//      return
//    }
//
//    // Show a loading message while fetching details
//    comparisonResults.innerHTML = `
//            <div class="loading-comparison">
//                <div class="spinner" style="width: 30px; height: 30px; border-width: 3px;"></div>
//                <p>Loading comparison...</p>
//            </div>
//        `
//
//    const [details1, details2] = await Promise.all([fetchCountryDetails(country1), fetchCountryDetails(country2)])
//
//    if (!details1 || !details2) {
//      comparisonResults.innerHTML = `
//                <div class="comparison-error">
//                    <p>Error fetching country details. Please try again later.</p>
//                </div>
//            `
//      return
//    }
//
//    // Build HTML for side-by-side display of country details
//    const resultHTML = `
//            <div class="comparison-column">
//                <h3>${details1.name.common}</h3>
//                <img src="${details1.flags.png}" alt="${details1.name.common} flag" class="comparison-flag">
//                <p><strong>Population:</strong> ${details1.population.toLocaleString()}</p>
//                <p><strong>Area:</strong> ${details1.area.toLocaleString()} km²</p>
//                <p><strong>Region:</strong> ${details1.region}</p>
//                <p><strong>Capital:</strong> ${details1.capital ? details1.capital.join(", ") : "N/A"}</p>
//                <p><strong>Languages:</strong> ${details1.languages ? Object.values(details1.languages).join(", ") : "N/A"}</p>
//                <p><strong>Currencies:</strong> ${
//                  details1.currencies
//                    ? Object.values(details1.currencies)
//                        .map((c) => `${c.name} (${c.symbol})`)
//                        .join(", ")
//                    : "N/A"
//                }</p>
//            </div>
//            <div class="comparison-column">
//                <h3>${details2.name.common}</h3>
//                <img src="${details2.flags.png}" alt="${details2.name.common} flag" class="comparison-flag">
//                <p><strong>Population:</strong> ${details2.population.toLocaleString()}</p>
//                <p><strong>Area:</strong> ${details2.area.toLocaleString()} km²</p>
//                <p><strong>Region:</strong> ${details2.region}</p>
//                <p><strong>Capital:</strong> ${details2.capital ? details2.capital.join(", ") : "N/A"}</p>
//                <p><strong>Languages:</strong> ${details2.languages ? Object.values(details2.languages).join(", ") : "N/A"}</p>
//                <p><strong>Currencies:</strong> ${
//                  details2.currencies
//                    ? Object.values(details2.currencies)
//                        .map((c) => `${c.name} (${c.symbol})`)
//                        .join(", ")
//                    : "N/A"
//                }</p>
//            </div>
//        `
//    comparisonResults.innerHTML = resultHTML
//  }
//
//  if (compareBtn) {
//    compareBtn.addEventListener("click", compareCountries)
//  } else {
//    console.error("Compare button not found in the modal.")
//  }
//
//  // Call this function to populate the dropdowns when the page loads
//  populateComparisonDropdowns()
//}
//"
//news.js"// === news.js - Handles news fetching and display ===
//
//document.addEventListener("DOMContentLoaded", initNewsFeature)
//
//function initNewsFeature() {
//  // Using Gnews API with your API key
//  const GNEWS_API_KEY = "f722aee7a01c3aadf85deec3f2069229"
//  const newsContent = document.getElementById("newsContent")
//  const newsToggle = document.getElementById("newsToggle")
//  const newsSection = document.querySelector(".news-section")
//
//  if (!newsContent) {
//    console.error("#newsContent element not found.")
//    return
//  }
//
//  // Toggle news panel
//  if (newsToggle) {
//    newsToggle.addEventListener("click", () => {
//      newsSection.classList.toggle("expanded")
//      newsToggle.innerHTML = newsSection.classList.contains("expanded")
//        ? '<i class="fas fa-chevron-right"></i>'
//        : '<i class="fas fa-chevron-left"></i>'
//    })
//  }
//
//  async function fetchCountryNews(country) {
//    try {
//      console.log(`Fetching news for ${country}`)
//
//      // First, get the country code using the REST Countries API
//      const countryResponse = await fetch(
//        `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=true`,
//      )
//      if (!countryResponse.ok) {
//        throw new Error(`Country API error: ${countryResponse.status}`)
//      }
//
//      const countryData = await countryResponse.json()
//      const countryCode = countryData[0]?.cca2?.toLowerCase()
//
//      // If we have a country code, use it to get news FROM that country
//      let apiUrl
//      if (countryCode) {
//        apiUrl = `https://gnews.io/api/v4/top-headlines?country=${countryCode}&lang=en&max=5&apikey=${GNEWS_API_KEY}`
//      } else {
//        // Fallback to searching for news ABOUT the country
//        apiUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(country)}&lang=en&max=5&apikey=${GNEWS_API_KEY}`
//      }
//
//      const response = await fetch(apiUrl)
//      if (!response.ok) {
//        throw new Error(`News API error: ${response.status}`)
//      }
//
//      const data = await response.json()
//      console.log("News data received:", data)
//      return {
//        articles: data.articles || [],
//        fromCountry: !!countryCode,
//      }
//    } catch (error) {
//      console.error("News fetch failed:", error)
//
//      // Try alternative approach - search for news about the country
//      try {
//        console.log("Trying alternative news approach...")
//        const apiUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(country)}&lang=en&max=5&apikey=${GNEWS_API_KEY}`
//        const response = await fetch(apiUrl)
//
//        if (!response.ok) throw new Error("Alternative approach failed")
//
//        const data = await response.json()
//        return {
//          articles: data.articles || [],
//          fromCountry: false,
//        }
//      } catch (altError) {
//        console.error("Alternative news approach failed:", altError)
//
//        // Return mock data as a last resort
//        return {
//          articles: [
//            {
//              title: `News about ${country}`,
//              description: `We couldn't fetch real news for ${country} at the moment. This is a placeholder article.`,
//              url: "#",
//              image: `https://via.placeholder.com/300x200?text=${encodeURIComponent(country)}`,
//              publishedAt: new Date().toISOString(),
//              source: { name: "TerraConnect" },
//            },
//            {
//              title: `${country} information`,
//              description: `Learn more about ${country} by clicking the Details button in the country popup.`,
//              url: "#",
//              publishedAt: new Date().toISOString(),
//              source: { name: "TerraConnect" },
//            },
//          ],
//          fromCountry: false,
//          isMock: true,
//        }
//      }
//    }
//  }
//
//  document.addEventListener("countrySelected", async (e) => {
//    const countryName = e.detail.country
//    if (!countryName) return
//
//    // Expand the news panel
//    newsSection.classList.add("expanded")
//    newsToggle.innerHTML = '<i class="fas fa-chevron-right"></i>'
//
//    // Show loading state
//    newsContent.innerHTML = `
//            <div class="loading-news">
//                <div class="spinner" style="width: 30px; height: 30px; border-width: 3px;"></div>
//                <p>Loading news for ${countryName}...</p>
//            </div>
//        `
//
//    const result = await fetchCountryNews(countryName)
//
//    if (!result) {
//      newsContent.innerHTML = `
//                <div class="news-error">
//                    <i class="fas fa-exclamation-circle"></i>
//                    <p>Error loading news. Please try again later.</p>
//                </div>
//            `
//    } else if (result.articles.length === 0) {
//      newsContent.innerHTML = `
//                <div class="news-error">
//                    <i class="fas fa-info-circle"></i>
//                    <p>No recent news found for <strong>${countryName}</strong>.</p>
//                </div>
//            `
//    } else {
//      const newsHTML = result.articles
//        .map(
//          (article) => `
//                    <div class="news-article">
//                        ${article.image ? `<img src="${article.image}" alt="${article.title}" class="news-image">` : ""}
//                        <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
//                        <p>${article.description ? article.description : "No description available."}</p>
//                        <div class="meta">
//                            <span>${article.source?.name || "Unknown"}</span>
//                            <span>${new Date(article.publishedAt).toLocaleDateString()}</span>
//                        </div>
//                    </div>
//                `,
//        )
//        .join("")
//
//      const headerText = result.isMock
//        ? `Information about ${countryName}`
//        : `${result.fromCountry ? "Latest News from" : "News about"} ${countryName}`
//
//      newsContent.innerHTML = `
//                <h2>${headerText}</h2>
//                ${result.isMock ? '<p class="mock-notice">Real news data is currently unavailable.</p>' : ""}
//                ${newsHTML}
//            `
//    }
//  })
//}
//"
//style.css"/* ===== GLOBAL STYLES ===== */
//:root {
//  --primary-color: #3498db;
//  --primary-dark: #2980b9;
//  --secondary-color: #2ecc71;
//  --secondary-dark: #27ae60;
//  --danger-color: #e74c3c;
//  --danger-dark: #c0392b;
//  --text-color: #333;
//  --text-light: #666;
//  --text-lighter: #999;
//  --bg-color: #f9f9f9;
//  --bg-light: #ffffff;
//  --bg-dark: #eaeaea;
//  --border-color: #ddd;
//  --border-radius: 8px;
//  --shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
//  --shadow-strong: 0 5px 15px rgba(0, 0, 0, 0.15);
//  --transition: all 0.3s ease;
//}
//
//* {
//  margin: 0;
//  padding: 0;
//  box-sizing: border-box;
//}
//
//body {
//  font-family: "Open Sans", sans-serif;
//  color: var(--text-color);
//  background-color: var(--bg-color);
//  line-height: 1.6;
//  overflow-x: hidden;
//}
//
//h1,
//h2,
//h3,
//h4,
//h5,
//h6 {
//  font-family: "Montserrat", sans-serif;
//  font-weight: 600;
//  margin-bottom: 0.5rem;
//}
//
//a {
//  color: var(--primary-color);
//  text-decoration: none;
//  transition: var(--transition);
//}
//
//a:hover {
//  color: var(--primary-dark);
//  text-decoration: underline;
//}
//
//button {
//  cursor: pointer;
//  font-family: "Montserrat", sans-serif;
//  border: none;
//  outline: none;
//  transition: var(--transition);
//}
//
//ul {
//  list-style: none;
//}
//
///* ===== BUTTONS ===== */
//.primary-button {
//  background-color: var(--primary-color);
//  color: white;
//  padding: 10px 20px;
//  border-radius: var(--border-radius);
//  font-weight: 600;
//  display: inline-flex;
//  align-items: center;
//  justify-content: center;
//  gap: 8px;
//}
//
//.primary-button:hover {
//  background-color: var(--primary-dark);
//  transform: translateY(-2px);
//  box-shadow: var(--shadow);
//}
//
//.secondary-button {
//  background-color: var(--secondary-color);
//  color: white;
//  padding: 10px 20px;
//  border-radius: var(--border-radius);
//  font-weight: 600;
//  display: inline-flex;
//  align-items: center;
//  justify-content: center;
//  gap: 8px;
//}
//
//.secondary-button:hover {
//  background-color: var(--secondary-dark);
//  transform: translateY(-2px);
//  box-shadow: var(--shadow);
//}
//
//.danger-button {
//  background-color: var(--danger-color);
//  color: white;
//  padding: 10px 20px;
//  border-radius: var(--border-radius);
//  font-weight: 600;
//  display: inline-flex;
//  align-items: center;
//  justify-content: center;
//  gap: 8px;
//}
//
//.danger-button:hover {
//  background-color: var(--danger-dark);
//  transform: translateY(-2px);
//  box-shadow: var(--shadow);
//}
//
//.action-button {
//  background-color: transparent;
//  color: var(--text-color);
//  padding: 8px 16px;
//  border-radius: var(--border-radius);
//  font-weight: 500;
//  display: inline-flex;
//  align-items: center;
//  justify-content: center;
//  gap: 8px;
//  border: 1px solid var(--border-color);
//}
//
//.action-button:hover {
//  background-color: var(--bg-dark);
//  transform: translateY(-2px);
//}
//
//.toggle-button {
//  background-color: transparent;
//  color: var(--text-color);
//  width: 30px;
//  height: 30px;
//  border-radius: 50%;
//  display: flex;
//  align-items: center;
//  justify-content: center;
//}
//
//.toggle-button:hover {
//  background-color: var(--bg-dark);
//}
//
///* ===== MAP CONTAINER ===== */
//#map {
//  height: 100vh;
//  width: 100%;
//  z-index: 1;
//}
//
///* ===== HOMEPAGE OVERLAY ===== */
//.homepage {
//  position: fixed;
//  top: 0;
//  left: 0;
//  width: 100%;
//  height: 100%;
//  background: linear-gradient(135deg, #3498db, #8e44ad);
//  display: flex;
//  justify-content: center;
//  align-items: center;
//  z-index: 1200;
//  text-align: center;
//}
//
//.homepage-content {
//  background-color: rgba(255, 255, 255, 0.9);
//  padding: 40px;
//  border-radius: var(--border-radius);
//  box-shadow: var(--shadow-strong);
//  max-width: 500px;
//  width: 90%;
//}
//
//.homepage h1 {
//  font-size: 3rem;
//  margin-bottom: 20px;
//  color: var(--primary-color);
//  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
//}
//
//.homepage p {
//  font-size: 1.2rem;
//  margin-bottom: 30px;
//  color: var(--text-color);
//}
//
///* ===== HEADER ===== */
//.app-header {
//  position: fixed;
//  top: 0;
//  left: 0;
//  width: 100%;
//  background-color: var(--bg-light);
//  padding: 15px 20px;
//  display: flex;
//  justify-content: space-between;
//  align-items: center;
//  box-shadow: var(--shadow);
//  z-index: 1000;
//}
//
//.logo {
//  font-family: "Montserrat", sans-serif;
//  font-weight: 700;
//  font-size: 1.5rem;
//  color: var(--primary-color);
//}
//
//.search-bar {
//  display: flex;
//  align-items: center;
//  background-color: var(--bg-color);
//  border-radius: 30px;
//  padding: 5px;
//  width: 300px;
//  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
//}
//
//.search-bar input {
//  border: none;
//  background: transparent;
//  padding: 8px 15px;
//  flex-grow: 1;
//  outline: none;
//  font-size: 0.9rem;
//}
//
//.search-bar button {
//  background-color: var(--primary-color);
//  color: white;
//  border: none;
//  border-radius: 50%;
//  width: 36px;
//  height: 36px;
//  display: flex;
//  align-items: center;
//  justify-content: center;
//  cursor: pointer;
//  transition: var(--transition);
//}
//
//.search-bar button:hover {
//  background-color: var(--primary-dark);
//  transform: scale(1.05);
//}
//
//.header-actions {
//  display: flex;
//  gap: 10px;
//}
//
///* ===== SIDEBAR ===== */
//.sidebar {
//  position: fixed;
//  left: 0;
//  top: 70px;
//  bottom: 0;
//  width: 280px;
//  background-color: var(--bg-light);
//  box-shadow: var(--shadow);
//  z-index: 900;
//  transition: var(--transition);
//  transform: translateX(-240px);
//}
//
//.sidebar.expanded {
//  transform: translateX(0);
//}
//
//.sidebar-header {
//  display: flex;
//  justify-content: space-between;
//  align-items: center;
//  padding: 15px;
//  background-color: var(--primary-color);
//  color: white;
//}
//
//.sidebar-header h3 {
//  margin: 0;
//  font-size: 1.1rem;
//}
//
//.sidebar-content {
//  padding: 15px;
//  height: calc(100% - 60px);
//  overflow-y: auto;
//  display: flex;
//  flex-direction: column;
//}
//
//#visited-list {
//  flex-grow: 1;
//  margin-bottom: 15px;
//  overflow-y: auto;
//}
//
//#visited-list li {
//  padding: 10px;
//  border-bottom: 1px solid var(--border-color);
//  display: flex;
//  align-items: center;
//  gap: 10px;
//}
//
//#visited-list li:last-child {
//  border-bottom: none;
//}
//
//#visited-list li:hover {
//  background-color: var(--bg-color);
//}
//
///* ===== NEWS SECTION ===== */
//.news-section {
//  position: fixed;
//  right: 0;
//  top: 70px;
//  bottom: 0;
//  width: 350px;
//  background-color: var(--bg-light);
//  box-shadow: var(--shadow);
//  z-index: 900;
//  transition: var(--transition);
//  transform: translateX(310px);
//}
//
//.news-section.expanded {
//  transform: translateX(0);
//}
//
//.news-header {
//  display: flex;
//  justify-content: space-between;
//  align-items: center;
//  padding: 15px;
//  background-color: var(--primary-color);
//  color: white;
//}
//
//.news-header h3 {
//  margin: 0;
//  font-size: 1.1rem;
//}
//
//.news-content {
//  padding: 15px;
//  height: calc(100% - 60px);
//  overflow-y: auto;
//}
//
//.news-placeholder {
//  display: flex;
//  flex-direction: column;
//  align-items: center;
//  justify-content: center;
//  height: 100%;
//  color: var(--text-lighter);
//  text-align: center;
//  padding: 20px;
//}
//
//.placeholder-icon {
//  font-size: 3rem;
//  margin-bottom: 15px;
//  opacity: 0.5;
//}
//
//.news-article {
//  background-color: var(--bg-color);
//  border-radius: var(--border-radius);
//  padding: 15px;
//  margin-bottom: 15px;
//  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
//  transition: var(--transition);
//}
//
//.news-article:hover {
//  transform: translateY(-3px);
//  box-shadow: var(--shadow);
//}
//
//.news-article h3 {
//  font-size: 1rem;
//  margin-bottom: 10px;
//}
//
//.news-article p {
//  font-size: 0.9rem;
//  color: var(--text-light);
//  margin-bottom: 10px;
//}
//
//.news-article .meta {
//  display: flex;
//  justify-content: space-between;
//  font-size: 0.8rem;
//  color: var(--text-lighter);
//}
//
//.news-error {
//  background-color: rgba(231, 76, 60, 0.1);
//  border-left: 3px solid var(--danger-color);
//  padding: 15px;
//  border-radius: var(--border-radius);
//  margin-top: 20px;
//}
//
///* ===== MODALS ===== */
//.modal {
//  display: none;
//  position: fixed;
//  z-index: 1100;
//  left: 0;
//  top: 0;
//  width: 100%;
//  height: 100%;
//  overflow: auto;
//  background-color: rgba(0, 0, 0, 0.5);
//  backdrop-filter: blur(3px);
//}
//
//.modal-content {
//  background-color: var(--bg-light);
//  margin: 5% auto;
//  border-radius: var(--border-radius);
//  box-shadow: var(--shadow-strong);
//  width: 90%;
//  max-width: 600px;
//  animation: modalFadeIn 0.3s;
//}
//
//@keyframes modalFadeIn {
//  from {
//    opacity: 0;
//    transform: translateY(-20px);
//  }
//  to {
//    opacity: 1;
//    transform: translateY(0);
//  }
//}
//
//.modal-header {
//  padding: 15px 20px;
//  border-bottom: 1px solid var(--border-color);
//  display: flex;
//  justify-content: space-between;
//  align-items: center;
//}
//
//.modal-header h2 {
//  margin: 0;
//  font-size: 1.5rem;
//  color: var(--primary-color);
//}
//
//.close-button {
//  font-size: 1.8rem;
//  font-weight: bold;
//  color: var(--text-lighter);
//  cursor: pointer;
//  transition: var(--transition);
//}
//
//.close-button:hover {
//  color: var(--danger-color);
//}
//
//.modal-body {
//  padding: 20px;
//}
//
//.modal-footer {
//  padding: 15px 20px;
//  border-top: 1px solid var(--border-color);
//  text-align: right;
//}
//
///* Game Modal Specific */
//.game-modal-content {
//  max-width: 500px;
//}
//
//.input-group {
//  display: flex;
//  gap: 10px;
//  margin: 15px 0;
//}
//
//.input-group input {
//  flex-grow: 1;
//  padding: 10px;
//  border: 1px solid var(--border-color);
//  border-radius: var(--border-radius);
//  outline: none;
//  transition: var(--transition);
//}
//
//.input-group input:focus {
//  border-color: var(--primary-color);
//  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
//}
//
//.feedback {
//  margin-top: 15px;
//  padding: 10px;
//  border-radius: var(--border-radius);
//  font-weight: 600;
//}
//
//.feedback.success {
//  background-color: rgba(46, 204, 113, 0.1);
//  color: var(--secondary-dark);
//  border-left: 3px solid var(--secondary-color);
//}
//
//.feedback.error {
//  background-color: rgba(231, 76, 60, 0.1);
//  color: var(--danger-dark);
//  border-left: 3px solid var(--danger-color);
//}
//
///* Comparison Modal Specific */
//.comparison-modal-content {
//  max-width: 800px;
//}
//
//.comparison-selectors {
//  display: flex;
//  flex-wrap: wrap;
//  gap: 15px;
//  margin-bottom: 20px;
//}
//
//.select-group {
//  flex: 1;
//  min-width: 200px;
//}
//
//.select-group label {
//  display: block;
//  margin-bottom: 5px;
//  font-weight: 600;
//  font-size: 0.9rem;
//}
//
//.select-group select {
//  width: 100%;
//  padding: 10px;
//  border: 1px solid var(--border-color);
//  border-radius: var(--border-radius);
//  outline: none;
//  transition: var(--transition);
//  background-color: white;
//}
//
//.select-group select:focus {
//  border-color: var(--primary-color);
//  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
//}
//
//.comparison-results {
//  display: flex;
//  flex-wrap: wrap;
//  gap: 20px;
//  margin-top: 20px;
//}
//
//.comparison-column {
//  flex: 1;
//  min-width: 200px;
//  background-color: var(--bg-color);
//  border-radius: var(--border-radius);
//  padding: 15px;
//  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
//}
//
//.comparison-column h3 {
//  color: var(--primary-color);
//  margin-bottom: 15px;
//  padding-bottom: 10px;
//  border-bottom: 1px solid var(--border-color);
//}
//
//.comparison-column p {
//  margin-bottom: 10px;
//}
//
//.comparison-column p:last-child {
//  margin-bottom: 0;
//}
//
///* Country Info Modal Specific */
//.country-info-modal-content {
//  max-width: 800px;
//}
//
//.country-info-container {
//  display: flex;
//  gap: 20px;
//  margin-bottom: 20px;
//}
//
//.country-flag-container {
//  width: 200px;
//  height: 120px;
//  overflow: hidden;
//  border-radius: var(--border-radius);
//  box-shadow: var(--shadow);
//}
//
//.country-flag-container img {
//  width: 100%;
//  height: 100%;
//  object-fit: cover;
//}
//
//.country-details {
//  flex: 1;
//}
//
//.country-details p {
//  margin-bottom: 8px;
//}
//
//.country-wiki h3 {
//  margin-bottom: 15px;
//  padding-bottom: 10px;
//  border-bottom: 1px solid var(--border-color);
//}
//
//.wiki-content {
//  line-height: 1.7;
//  color: var(--text-light);
//}
//
///* ===== LEAFLET CUSTOMIZATIONS ===== */
//.leaflet-popup-content-wrapper {
//  border-radius: var(--border-radius);
//  box-shadow: var(--shadow);
//  padding: 0;
//}
//
//.leaflet-popup-content {
//  margin: 0;
//  width: 250px !important;
//}
//
//.country-popup {
//  padding: 15px;
//}
//
//.country-popup h3 {
//  margin-top: 0;
//  margin-bottom: 15px;
//  color: var(--primary-color);
//  font-size: 1.2rem;
//  text-align: center;
//}
//
//.country-popup-buttons {
//  display: flex;
//  gap: 10px;
//  margin-top: 15px;
//}
//
//.country-popup-buttons button {
//  flex: 1;
//  padding: 8px;
//  font-size: 0.9rem;
//  border-radius: var(--border-radius);
//  background-color: var(--primary-color);
//  color: white;
//  border: none;
//  cursor: pointer;
//  transition: var(--transition);
//}
//
//.country-popup-buttons button:hover {
//  background-color: var(--primary-dark);
//}
//
///* ===== LOADING OVERLAY ===== */
//.loading-overlay {
//  position: fixed;
//  top: 0;
//  left: 0;
//  width: 100%;
//  height: 100%;
//  background-color: rgba(255, 255, 255, 0.8);
//  display: flex;
//  flex-direction: column;
//  justify-content: center;
//  align-items: center;
//  z-index: 2000;
//}
//
//.spinner {
//  width: 50px;
//  height: 50px;
//  border: 5px solid var(--bg-dark);
//  border-top: 5px solid var(--primary-color);
//  border-radius: 50%;
//  animation: spin 1s linear infinite;
//  margin-bottom: 20px;
//}
//
//@keyframes spin {
//  0% {
//    transform: rotate(0deg);
//  }
//  100% {
//    transform: rotate(360deg);
//  }
//}
//
///* ===== RESPONSIVE DESIGN ===== */
//@media (max-width: 768px) {
//  .app-header {
//    flex-direction: column;
//    padding: 10px;
//  }
//
//  .logo {
//    margin-bottom: 10px;
//  }
//
//  .search-bar {
//    width: 100%;
//    margin-bottom: 10px;
//  }
//
//  .header-actions {
//    width: 100%;
//    justify-content: space-between;
//  }
//
//  .sidebar,
//  .news-section {
//    width: 100%;
//    height: 50%;
//    top: auto;
//    bottom: 0;
//    transform: translateY(calc(100% - 60px));
//  }
//
//  .sidebar.expanded,
//  .news-section.expanded {
//    transform: translateY(0);
//  }
//
//  .sidebar-header,
//  .news-header {
//    flex-direction: row-reverse;
//  }
//
//  .country-info-container {
//    flex-direction: column;
//  }
//
//  .country-flag-container {
//    width: 100%;
//    height: 150px;
//  }
//
//  .comparison-selectors {
//    flex-direction: column;
//  }
//}
//"
//
//
//index.html"<!DOCTYPE html>
//<html lang="en">
//<head>
//    <title>TerraConnect: Global Interactive News Map</title>
//    <meta charset="UTF-8">
//    <meta name="viewport" content="width=device-width, initial-scale=1.0">
//    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
//    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">
//    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
//    <link rel="stylesheet" href="style.css">
//</head>
//<body>
//    <!-- Homepage Overlay -->
//    <div id="homepage" class="homepage">
//        <div class="homepage-content">
//            <h1>TerraConnect</h1>
//            <p>Explore the world map, discover country information, and read the latest news.</p>
//            <button id="enterMapBtn" class="primary-button">
//                <i class="fas fa-globe-americas"></i> Enter Map
//            </button>
//        </div>
//    </div>
//
//    <!-- Map Container -->
//    <div id="map"></div>
//
//    <!-- Header with Search Bar -->
//    <header class="app-header">
//        <div class="logo">TerraConnect</div>
//        <div class="search-bar">
//            <input type="text" id="searchInput" placeholder="Search for a country...">
//            <button id="searchBtn">
//                <i class="fas fa-search"></i>
//            </button>
//        </div>
//        <div class="header-actions">
//            <button id="compareCountriesBtn" class="action-button">
//                <i class="fas fa-balance-scale"></i> Compare
//            </button>
//            <button id="startGameBtn" class="action-button">
//                <i class="fas fa-gamepad"></i> Game
//            </button>
//        </div>
//    </header>
//
//    <!-- Visited Countries Sidebar -->
//    <div class="sidebar">
//        <div class="sidebar-header">
//            <h3>Visited Countries</h3>
//            <button id="sidebarToggle" class="toggle-button">
//                <i class="fas fa-chevron-right"></i>
//            </button>
//        </div>
//        <div class="sidebar-content">
//            <ul id="visited-list"></ul>
//            <button id="clearVisitedBtn" class="danger-button">
//                <i class="fas fa-trash-alt"></i> Clear Visited
//            </button>
//        </div>
//    </div>
//
//    <!-- News Section -->
//    <div class="news-section">
//        <div class="news-header">
//            <h3>Country News</h3>
//            <button id="newsToggle" class="toggle-button">
//                <i class="fas fa-chevron-left"></i>
//            </button>
//        </div>
//        <div class="news-content" id="newsContent">
//            <div class="news-placeholder">
//                <i class="fas fa-newspaper placeholder-icon"></i>
//                <p>Click on a country to see the latest news</p>
//            </div>
//        </div>
//    </div>
//
//    <!-- Game Modal -->
//    <div id="gameModal" class="modal">
//        <div class="modal-content game-modal-content">
//            <div class="modal-header">
//                <h2>Country Guessing Game</h2>
//                <span id="closeGameModal" class="close-button">&times;</span>
//            </div>
//            <div class="modal-body">
//                <p>Can you guess the highlighted country?</p>
//                <div class="input-group">
//                    <input type="text" id="game-guess" placeholder="Enter country name...">
//                    <button id="submit-guess-btn" class="primary-button">Submit</button>
//                </div>
//                <div id="game-feedback" class="feedback"></div>
//            </div>
//            <div class="modal-footer">
//                <button id="new-game-btn" class="secondary-button">New Country</button>
//            </div>
//        </div>
//    </div>
//
//    <!-- Country Comparison Modal -->
//    <div id="comparisonModal" class="modal">
//        <div class="modal-content comparison-modal-content">
//            <div class="modal-header">
//                <h2>Compare Countries</h2>
//                <span id="closeComparisonModal" class="close-button">&times;</span>
//            </div>
//            <div class="modal-body">
//                <div class="comparison-selectors">
//                    <div class="select-group">
//                        <label for="country1">First Country</label>
//                        <select id="country1">
//                            <option value="">Select country</option>
//                        </select>
//                    </div>
//                    <div class="select-group">
//                        <label for="country2">Second Country</label>
//                        <select id="country2">
//                            <option value="">Select country</option>
//                        </select>
//                    </div>
//                    <button id="compareBtn" class="primary-button">Compare</button>
//                </div>
//                <div id="comparisonResults" class="comparison-results"></div>
//            </div>
//        </div>
//    </div>
//
//    <!-- Country Info Modal -->
//    <div id="countryInfoModal" class="modal">
//        <div class="modal-content country-info-modal-content">
//            <div class="modal-header">
//                <h2 id="countryInfoTitle">Country Information</h2>
//                <span id="closeCountryInfoModal" class="close-button">&times;</span>
//            </div>
//            <div class="modal-body">
//                <div class="country-info-container">
//                    <div class="country-flag-container">
//                        <img id="countryFlag" src="/placeholder.svg" alt="Country flag">
//                    </div>
//                    <div class="country-details" id="countryDetails">
//                        <!-- Country details will be inserted here -->
//                    </div>
//                </div>
//                <div class="country-wiki">
//                    <h3>About</h3>
//                    <div id="countryWiki" class="wiki-content">
//                        <!-- Wikipedia content will be inserted here -->
//                    </div>
//                </div>
//            </div>
//        </div>
//    </div>
//
//    <!-- Loading Overlay -->
//    <div id="loadingOverlay" class="loading-overlay">
//        <div class="spinner"></div>
//        <p>Loading...</p>
//    </div>
//
//    <!-- Scripts -->
//    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
//    <script src="js/map.js"></script>
//<script src="js/comparison.js"></script>
//<script src="js/news.js"></script>
//    <script src="ui.js"></script>
//</body>
//</html>
//"
//</link>
//
//
//*/
