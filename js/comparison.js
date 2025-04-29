// === comparison.js - Handles country comparison functionality ===

document.addEventListener("DOMContentLoaded", initComparisonFeature)

function initComparisonFeature() {
  const comparisonModal = document.getElementById("comparisonModal")
  const closeComparisonModal = document.getElementById("closeComparisonModal")
  const compareBtn = document.getElementById("compareBtn")
  const country1Select = document.getElementById("country1")
  const country2Select = document.getElementById("country2")
  const comparisonResults = document.getElementById("comparisonResults")
  const compareCountriesBtn = document.getElementById("compareCountriesBtn")

  if (!comparisonModal) {
    console.error("Comparison modal not found.")
    return
  }
  if (!compareCountriesBtn) {
    console.error("Compare Countries button not found.")
    return
  }

  // Open the comparison modal when the button is clicked
  function openComparisonModal() {
    comparisonModal.style.display = "block"
  }

  compareCountriesBtn.addEventListener("click", openComparisonModal)

  // Close the modal when the close button is clicked
  if (closeComparisonModal) {
    closeComparisonModal.addEventListener("click", () => {
      comparisonModal.style.display = "none"
    })
  }

  // Close the modal when clicking outside of it
  window.addEventListener("click", (e) => {
    if (e.target === comparisonModal) {
      comparisonModal.style.display = "none"
    }
  })

  // Populate dropdowns with country names from the Rest Countries API
  async function populateComparisonDropdowns() {
    try {
      const response = await fetch("https://restcountries.com/v3.1/all")
      const data = await response.json()
      const countryNames = data.map((country) => country.name.common).sort()

      countryNames.forEach((country) => {
        const option1 = document.createElement("option")
        option1.value = country
        option1.textContent = country
        country1Select.appendChild(option1)

        const option2 = document.createElement("option")
        option2.value = country
        option2.textContent = country
        country2Select.appendChild(option2)
      })
    } catch (error) {
      console.error("Error fetching country list:", error)
      comparisonResults.innerHTML = `
                <div class="comparison-error">
                    <p>Error loading country list. Please try again later.</p>
                </div>
            `
    }
  }

  // Fetch details for a given country using the Rest Countries API
  async function fetchCountryDetails(countryName) {
    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}?fullText=true`,
      )
      const data = await response.json()
      return data[0]
    } catch (error) {
      console.error(`Error fetching details for ${countryName}:`, error)
      return null
    }
  }

  // Compare the two selected countries and display the results
  async function compareCountries() {
    const country1 = country1Select.value
    const country2 = country2Select.value

    if (!country1 || !country2) {
      alert("Please select both countries.")
      return
    }

    // Show a loading message while fetching details
    comparisonResults.innerHTML = `
            <div class="loading-comparison">
                <div class="spinner" style="width: 30px; height: 30px; border-width: 3px;"></div>
                <p>Loading comparison...</p>
            </div>
        `

    const [details1, details2] = await Promise.all([fetchCountryDetails(country1), fetchCountryDetails(country2)])

    if (!details1 || !details2) {
      comparisonResults.innerHTML = `
                <div class="comparison-error">
                    <p>Error fetching country details. Please try again later.</p>
                </div>
            `
      return
    }

    // Build HTML for side-by-side display of country details
    const resultHTML = `
            <div class="comparison-column">
                <h3>${details1.name.common}</h3>
                <img src="${details1.flags.png}" alt="${details1.name.common} flag" class="comparison-flag">
                <p><strong>Population:</strong> ${details1.population.toLocaleString()}</p>
                <p><strong>Area:</strong> ${details1.area.toLocaleString()} km²</p>
                <p><strong>Region:</strong> ${details1.region}</p>
                <p><strong>Capital:</strong> ${details1.capital ? details1.capital.join(", ") : "N/A"}</p>
                <p><strong>Languages:</strong> ${details1.languages ? Object.values(details1.languages).join(", ") : "N/A"}</p>
                <p><strong>Currencies:</strong> ${
                  details1.currencies
                    ? Object.values(details1.currencies)
                        .map((c) => `${c.name} (${c.symbol})`)
                        .join(", ")
                    : "N/A"
                }</p>
            </div>
            <div class="comparison-column">
                <h3>${details2.name.common}</h3>
                <img src="${details2.flags.png}" alt="${details2.name.common} flag" class="comparison-flag">
                <p><strong>Population:</strong> ${details2.population.toLocaleString()}</p>
                <p><strong>Area:</strong> ${details2.area.toLocaleString()} km²</p>
                <p><strong>Region:</strong> ${details2.region}</p>
                <p><strong>Capital:</strong> ${details2.capital ? details2.capital.join(", ") : "N/A"}</p>
                <p><strong>Languages:</strong> ${details2.languages ? Object.values(details2.languages).join(", ") : "N/A"}</p>
                <p><strong>Currencies:</strong> ${
                  details2.currencies
                    ? Object.values(details2.currencies)
                        .map((c) => `${c.name} (${c.symbol})`)
                        .join(", ")
                    : "N/A"
                }</p>
            </div>
        `
    comparisonResults.innerHTML = resultHTML
  }

  if (compareBtn) {
    compareBtn.addEventListener("click", compareCountries)
  } else {
    console.error("Compare button not found in the modal.")
  }

  // Call this function to populate the dropdowns when the page loads
  populateComparisonDropdowns()
}