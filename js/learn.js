// === learn.js - Handles educational learning functionality for children ===

document.addEventListener("DOMContentLoaded", initLearnMode)

function initLearnMode() {
  // Get the learn button that's already in the HTML
  const learnBtn = document.getElementById("learnModeBtn")

  if (learnBtn) {
    learnBtn.addEventListener("click", openLearnModal)
  }

  // Initialize learn modal (already in HTML)
  const learnModal = document.getElementById("learnModal")

  // Add event listeners
  document.getElementById("closeLearnModal").addEventListener("click", closeLearnModal)

  // Window click to close modal
  window.addEventListener("click", (e) => {
    if (e.target === learnModal) {
      closeLearnModal()
    }
  })

  // Initialize the explore mode when country data is available
  const checkDataInterval = setInterval(() => {
    if (window.countryData && window.countryData.length > 0) {
      initExploreMode()
      clearInterval(checkDataInterval)
    }
  }, 1000)

  // Check if we need to show a specific country
  if (window.learnTargetCountry) {
    const targetCountry = window.learnTargetCountry
    window.learnTargetCountry = null // Clear it after use

    // Wait for country data to be available
    const waitForCountryData = setInterval(() => {
      if (window.countryData && window.countryData.length > 0) {
        clearInterval(waitForCountryData)

        // Find the country in the data
        const country = window.countryData.find((c) => c.name.common === targetCountry)
        if (country) {
          showCountryInLearnMode(country)
        } else {
          initExploreMode() // Fallback to random country
        }
      }
    }, 500)
  }
}

function openLearnModal() {
  const learnModal = document.getElementById("learnModal")
  if (learnModal) {
    learnModal.style.display = "block"

    // Only initialize explore mode if we don't have a target country
    if (!window.learnTargetCountry) {
      initExploreMode()
    }
  }
}

function closeLearnModal() {
  const learnModal = document.getElementById("learnModal")
  if (learnModal) {
    learnModal.style.display = "none"
  }
}

// Get random countries for exploration
function getRandomCountries(count) {
  if (!window.countryData || window.countryData.length === 0) {
    return []
  }

  const countries = [...window.countryData]
  const result = []

  for (let i = 0; i < count && countries.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * countries.length)
    result.push(countries.splice(randomIndex, 1)[0])
  }

  return result
}

// Show a specific country in learn mode
function showCountryInLearnMode(country) {
  if (!country) return

  updateLearnUI(country)
}

// Update the learn UI with country data
function updateLearnUI(country) {
  // Update the modal content with the new child-friendly learning interface
  const modalBody = document.querySelector("#learnModal .modal-body")

  // Create a simple, colorful, and educational interface
  modalBody.innerHTML = `
    <div class="learn-container">
      <div class="learn-header">
        <h3>Let's Explore: ${country.name.common}</h3>
        <button id="exploreNewCountry" class="primary-button">
          <i class="fas fa-globe"></i> Explore Another Country
        </button>
      </div>
      
      <div class="learn-content">
        <div class="learn-flag-container">
          <img src="${country.flags.png}" alt="Flag of ${country.name.common}" class="learn-flag">
          <p class="learn-flag-caption">This is the flag of ${country.name.common}!</p>
        </div>
        
        <div class="learn-facts">
          <div class="learn-fact">
            <i class="fas fa-map-marker-alt"></i>
            <p>${country.name.common} is located in <strong>${country.region || "the world"}</strong>.</p>
          </div>
          
          <div class="learn-fact">
            <i class="fas fa-city"></i>
            <p>The capital city is <strong>${country.capital ? country.capital[0] : "unknown"}</strong>.</p>
          </div>
          
          <div class="learn-fact">
            <i class="fas fa-users"></i>
            <p>About <strong>${(country.population / 1000000).toFixed(1)} million</strong> people live there.</p>
          </div>
          
          ${
            country.languages
              ? `
          <div class="learn-fact">
            <i class="fas fa-comments"></i>
            <p>People speak ${Object.values(country.languages).slice(0, 2).join(" and ")}.</p>
          </div>
          `
              : ""
          }
          
          ${
            country.borders && country.borders.length > 0
              ? `
          <div class="learn-fact">
            <i class="fas fa-handshake"></i>
            <p>${country.name.common} has ${country.borders.length} neighboring ${country.borders.length === 1 ? "country" : "countries"}.</p>
          </div>
          `
              : ""
          }
        </div>
      </div>
      
      <div class="learn-actions">
        <button id="showOnMap" class="secondary-button">
          <i class="fas fa-map"></i> Show on Map
        </button>
        <button id="funFact" class="secondary-button">
          <i class="fas fa-star"></i> Fun Fact
        </button>
      </div>
      
      <div id="funFactContainer" class="fun-fact-container hidden">
        <p id="funFactText"></p>
      </div>
    </div>
  `

  // Add event listeners
  document.getElementById("exploreNewCountry").addEventListener("click", initExploreMode)

  document.getElementById("showOnMap").addEventListener("click", () => {
    // Don't close the modal
    // Find the country on the map and zoom to it
    if (window.countryLayers && window.countryLayers[country.name.common]) {
      const layer = window.countryLayers[country.name.common]
      window.map.fitBounds(layer.getBounds())
      layer.setStyle({ color: "#e74c3c", weight: 3, fillOpacity: 0.2 })

      // Reset style after 3 seconds
      setTimeout(() => {
        if (window.geojsonLayer) {
          window.geojsonLayer.resetStyle(layer)
        }
      }, 3000)
    }
  })

  document.getElementById("funFact").addEventListener("click", () => {
    const funFactContainer = document.getElementById("funFactContainer")
    const funFactText = document.getElementById("funFactText")

    // Generate a random fun fact about the country
    const funFacts = [
      `${country.name.common} ${country.independent ? "is an independent country" : "is not fully independent"}.`,
      `The internet domain for ${country.name.common} is .${country.tld ? country.tld[0] : "unknown"}.`,
      `${country.name.common} ${country.landlocked ? "has no coastline" : "has access to the ocean"}.`,
      `${country.name.common} is ${country.area ? formatArea(country.area) : "unknown"} in size.`,
      `${country.name.common} ${country.unMember ? "is a member of the United Nations" : "is not a member of the United Nations"}.`,
      `People in ${country.name.common} drive on the ${country.car?.side || "right"} side of the road.`,
      `${country.name.common} has ${country.timezones?.length || 1} time ${country.timezones?.length === 1 ? "zone" : "zones"}.`,
    ]

    // Display a random fun fact
    const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)]
    funFactText.textContent = randomFact
    funFactContainer.classList.remove("hidden")
  })
}

// Initialize the explore mode
function initExploreMode() {
  // Get a random country to explore
  const country = getRandomCountries(1)[0]
  if (!country) return

  updateLearnUI(country)
}

// Format area in a child-friendly way
function formatArea(area) {
  if (area < 1000) {
    return `${area} square kilometers (very small)`
  } else if (area < 100000) {
    return `${Math.round(area / 1000)} thousand square kilometers (small)`
  } else if (area < 1000000) {
    return `${Math.round(area / 1000)} thousand square kilometers (medium sized)`
  } else {
    return `${Math.round(area / 1000000)} million square kilometers (very big)`
  }
}

// Make this function available globally for the map.js to use
window.openLearnForCountry = (countryName) => {
  // Open the learn modal
  const learnModal = document.getElementById("learnModal")
  if (learnModal) {
    learnModal.style.display = "block"

    // Find the country in the data
    if (window.countryData && window.countryData.length > 0) {
      const country = window.countryData.find((c) => c.name.common === countryName)
      if (country) {
        showCountryInLearnMode(country)
      } else {
        // If country not found, just show random
        initExploreMode()
      }
    } else {
      // Store the country name for later when data is available
      window.learnTargetCountry = countryName
    }
  }
}



