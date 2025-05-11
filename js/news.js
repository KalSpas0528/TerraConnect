// === news.js - Handles news fetching and display ===

document.addEventListener("DOMContentLoaded", initNewsFeature)

function initNewsFeature() {
  // Using Gnews API with your API key
  const GNEWS_API_KEY = "f722aee7a01c3aadf85deec3f2069229"
  const newsContent = document.getElementById("newsContent")
  const newsToggle = document.getElementById("newsToggle")
  const newsSection = document.querySelector(".news-section")

  // Country-specific news database for fallback
  const countryNewsDatabase = {}

  // Country name corrections for API
  const countryNameCorrections = {
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

  if (!newsContent) {
    console.error("#newsContent element not found.")
    return
  }

  // Toggle news panel
  if (newsToggle) {
    newsToggle.addEventListener("click", () => {
      newsSection.classList.toggle("expanded")
      newsToggle.innerHTML = newsSection.classList.contains("expanded")
        ? '<i class="fas fa-chevron-right"></i>'
        : '<i class="fas fa-chevron-left"></i>'
    })
  }

  // Initialize the country news database with some predefined news
  async function initCountryNewsDatabase() {
    try {
      // Fetch all countries to build our database
      const response = await fetch("https://restcountries.com/v3.1/all")
      const countries = await response.json()

      // Create mock news for each country
      countries.forEach((country) => {
        const countryName = country.name.common
        const countryCode = country.cca2
        const capital = country.capital ? country.capital[0] : "the capital"
        const region = country.region
        const subregion = country.subregion || region
        const flag = country.flags.png

        // Generate 5 mock news articles specific to this country
        countryNewsDatabase[countryName] = {
          flag: flag,
          articles: [
            {
              title: `Economic Development in ${countryName}`,
              description: `Recent economic initiatives in ${countryName} have shown promising results, with growth reported across multiple sectors.`,
              url: `https://en.wikipedia.org/wiki/${encodeURIComponent(countryName)}`,
              image: `https://source.unsplash.com/featured/?${encodeURIComponent(countryName)},city`,
              publishedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
              source: { name: "TerraConnect Economics" },
            },
            {
              title: `Cultural Festival Celebrates ${countryName}'s Heritage`,
              description: `A major cultural festival in ${capital} showcases the rich traditions and heritage of ${countryName}.`,
              url: `https://en.wikipedia.org/wiki/Culture_of_${encodeURIComponent(countryName)}`,
              image: `https://source.unsplash.com/featured/?${encodeURIComponent(countryName)},culture`,
              publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
              source: { name: "Global Culture Review" },
            },
            {
              title: `Tourism in ${countryName} Sees Significant Growth`,
              description: `${countryName}'s tourism sector has reported a substantial increase in visitors, highlighting the country's appeal as a travel destination.`,
              url: `https://en.wikipedia.org/wiki/Tourism_in_${encodeURIComponent(countryName)}`,
              image: `https://source.unsplash.com/featured/?${encodeURIComponent(countryName)},landscape`,
              publishedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
              source: { name: "Travel Insights" },
            },
            {
              title: `${countryName} Strengthens International Relations`,
              description: `Diplomatic efforts by ${countryName} have led to improved relations with neighboring countries in ${subregion}.`,
              url: `https://en.wikipedia.org/wiki/Foreign_relations_of_${encodeURIComponent(countryName)}`,
              image: `https://source.unsplash.com/featured/?${encodeURIComponent(countryName)},flag`,
              publishedAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
              source: { name: "International Affairs" },
            },
            {
              title: `Environmental Initiatives in ${countryName}`,
              description: `New environmental protection measures in ${countryName} aim to preserve the country's natural resources and biodiversity.`,
              url: `https://en.wikipedia.org/wiki/Geography_of_${encodeURIComponent(countryName)}`,
              image: `https://source.unsplash.com/featured/?${encodeURIComponent(countryName)},nature`,
              publishedAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
              source: { name: "Environmental Watch" },
            },
          ],
        }
      })

      console.log("Country news database initialized with mock data")
    } catch (error) {
      console.error("Error initializing country news database:", error)
    }
  }

  // Initialize the database when the page loads
  initCountryNewsDatabase()

  async function fetchCountryNews(country) {
    try {
      console.log(`Fetching news for ${country}`)

      // Check if we need to correct the country name for the API
      const correctedCountryName = countryNameCorrections[country] || country

      // First, get the country code using the REST Countries API
      const countryResponse = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(correctedCountryName)}?fullText=true`,
      )

      if (!countryResponse.ok) {
        throw new Error(`Country API error: ${countryResponse.status}`)
      }

      const countryData = await countryResponse.json()
      const countryCode = countryData[0]?.cca2?.toLowerCase()
      const countryFlag = countryData[0]?.flags?.png

      // Try to get country-specific news using the country name in the query
      const apiUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(country)}&lang=en&max=10&apikey=${GNEWS_API_KEY}`

      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("News data received:", data)

      // Filter articles to ensure they're actually about this country
      let filteredArticles = data.articles || []

      // If we have articles, try to filter them to be more country-specific
      if (filteredArticles.length > 0) {
        // Try to filter articles that mention the country name in title or description
        const countrySpecificArticles = filteredArticles.filter(
          (article) =>
            article.title.includes(country) || (article.description && article.description.includes(country)),
        )

        // If we have country-specific articles, use those, otherwise use all articles
        if (countrySpecificArticles.length >= 3) {
          filteredArticles = countrySpecificArticles
        }
      }

      return {
        articles: filteredArticles,
        fromCountry: true,
        flag: countryFlag,
      }
    } catch (error) {
      console.error("News fetch failed:", error)

      // Try alternative approach - search for news about the country
      try {
        console.log("Trying alternative news approach...")
        const apiUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(country)}&lang=en&max=5&apikey=${GNEWS_API_KEY}`
        const response = await fetch(apiUrl)

        if (!response.ok) throw new Error("Alternative approach failed")

        const data = await response.json()

        // Get country flag
        let countryFlag = null
        try {
          // Check if we need to correct the country name for the API
          const correctedCountryName = countryNameCorrections[country] || country

          const countryResponse = await fetch(
            `https://restcountries.com/v3.1/name/${encodeURIComponent(correctedCountryName)}?fullText=true`,
          )
          const countryData = await countryResponse.json()
          countryFlag = countryData[0]?.flags?.png
        } catch (e) {
          console.error("Could not fetch country flag:", e)
        }

        return {
          articles: data.articles || [],
          fromCountry: false,
          flag: countryFlag,
        }
      } catch (altError) {
        console.error("Alternative news approach failed:", altError)

        // Use our pre-generated country-specific news database as fallback
        if (countryNewsDatabase[country]) {
          console.log("Using pre-generated country news for", country)
          return {
            articles: countryNewsDatabase[country].articles,
            fromCountry: true,
            flag: countryNewsDatabase[country].flag,
            isMock: true,
          }
        }

        // If all else fails, generate some mock data on the fly
        console.log("Generating mock news for", country)

        // Try to get country flag
        let countryFlag = null
        try {
          // Check if we need to correct the country name for the API
          const correctedCountryName = countryNameCorrections[country] || country

          const countryResponse = await fetch(
            `https://restcountries.com/v3.1/name/${encodeURIComponent(correctedCountryName)}?fullText=true`,
          )
          const countryData = await countryResponse.json()
          countryFlag = countryData[0]?.flags?.png
        } catch (e) {
          console.error("Could not fetch country flag:", e)
        }

        return {
          articles: [
            {
              title: `Latest developments in ${country}`,
              description: `Stay updated with the most recent events and news from ${country}.`,
              url: `https://en.wikipedia.org/wiki/${encodeURIComponent(country)}`,
              image: `https://source.unsplash.com/featured/?${encodeURIComponent(country)}`,
              publishedAt: new Date().toISOString(),
              source: { name: "TerraConnect News" },
            },
            {
              title: `${country}'s economic outlook`,
              description: `Analysis of current economic trends and future prospects for ${country}.`,
              url: `https://en.wikipedia.org/wiki/Economy_of_${encodeURIComponent(country)}`,
              image: `https://source.unsplash.com/featured/?${encodeURIComponent(country)},city`,
              publishedAt: new Date(Date.now() - 86400000).toISOString(),
              source: { name: "TerraConnect Economics" },
            },
            {
              title: `Cultural highlights from ${country}`,
              description: `Explore the rich cultural heritage and traditions of ${country}.`,
              url: `https://en.wikipedia.org/wiki/Culture_of_${encodeURIComponent(country)}`,
              image: `https://source.unsplash.com/featured/?${encodeURIComponent(country)},culture`,
              publishedAt: new Date(Date.now() - 172800000).toISOString(),
              source: { name: "Global Culture Review" },
            },
          ],
          fromCountry: true,
          flag: countryFlag,
          isMock: true,
        }
      }
    }
  }

  document.addEventListener("countrySelected", async (e) => {
    const countryName = e.detail.country
    if (!countryName) return

    // Check if Junior Explorer mode is enabled
    if (window.isJuniorExplorerEnabled && window.isJuniorExplorerEnabled()) {
      // In Junior Explorer mode, show a child-friendly message instead of news
      newsContent.innerHTML = `
      <div class="junior-explorer-message">
        <img src="https://source.unsplash.com/featured/?kids,learning" alt="Junior Explorer mode" class="junior-explorer-image">
        <h3>News is not available in Junior Explorer Mode</h3>
        <p>Ask a grown-up to turn off Junior Explorer Mode if you want to see news about ${countryName}.</p>
        <p>Instead, try the Learn button to discover fun facts about countries!</p>
        <button id="openLearnBtn" class="primary-button">
          <i class="fas fa-graduation-cap"></i> Learn About Countries
        </button>
      </div>
    `

      // Add event listener to the learn button
      document.getElementById("openLearnBtn").addEventListener("click", () => {
        // Close news panel
        newsSection.classList.remove("expanded")
        newsToggle.innerHTML = '<i class="fas fa-chevron-left"></i>'

        // Open learn modal
        const learnBtn = document.getElementById("learnModeBtn")
        if (learnBtn) {
          learnBtn.click()
        }
      })

      return
    }

    // Expand the news panel
    newsSection.classList.add("expanded")
    newsToggle.innerHTML = '<i class="fas fa-chevron-right"></i>'

    // Show loading state
    newsContent.innerHTML = `
      <div class="loading-news">
        <div class="spinner" style="width: 30px; height: 30px; border-width: 3px;"></div>
        <p>Loading news for ${countryName}...</p>
      </div>
    `

    const result = await fetchCountryNews(countryName)

    if (!result) {
      newsContent.innerHTML = `
        <div class="news-error">
          <i class="fas fa-exclamation-circle"></i>
          <p>Error loading news. Please try again later.</p>
        </div>
      `
    } else if (result.articles.length === 0) {
      newsContent.innerHTML = `
        <div class="news-error">
          <i class="fas fa-info-circle"></i>
          <p>No recent news found for <strong>${countryName}</strong>.</p>
        </div>
      `
    } else {
      const newsHTML = result.articles
        .map(
          (article) => `
            <div class="news-article">
              ${article.image ? `<img src="${article.image}" alt="${article.title}" class="news-image">` : ""}
              <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
              <p>${article.description ? article.description : "No description available."}</p>
              <div class="meta">
                <span>${article.source?.name || "Unknown"}</span>
                <span>${new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
          `,
        )
        .join("")

      const headerText = result.isMock
        ? `Information about ${countryName}`
        : `${result.fromCountry ? "Latest News from" : "News about"} ${countryName}`

      newsContent.innerHTML = `
        <div class="country-news-header">
          ${result.flag ? `<img src="${result.flag}" alt="${countryName} flag">` : ""}
          <h2>${headerText}</h2>
          <button id="closeNewsBtn" class="close-news-btn" title="Close News">
            <i class="fas fa-times"></i>
          </button>
        </div>
        ${result.isMock ? '<p class="mock-notice">Using curated information for this country. Live news may not be available.</p>' : ""}
        ${newsHTML}
      `

      // Add event listener to the close news button
      document.getElementById("closeNewsBtn").addEventListener("click", () => {
        newsSection.classList.remove("expanded")
        newsToggle.innerHTML = '<i class="fas fa-chevron-left"></i>'
      })
    }
  })
}



