// === news.js - Handles news fetching and display ===

document.addEventListener("DOMContentLoaded", initNewsFeature)

function initNewsFeature() {
  // Using Gnews API with your API key
  const GNEWS_API_KEY = "f722aee7a01c3aadf85deec3f2069229"
  const newsContent = document.getElementById("newsContent")
  const newsToggle = document.getElementById("newsToggle")
  const newsSection = document.querySelector(".news-section")

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

  async function fetchCountryNews(country) {
    try {
      console.log(`Fetching news for ${country}`)

      // First, get the country code using the REST Countries API
      const countryResponse = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=true`,
      )
      if (!countryResponse.ok) {
        throw new Error(`Country API error: ${countryResponse.status}`)
      }

      const countryData = await countryResponse.json()
      const countryCode = countryData[0]?.cca2?.toLowerCase()

      // If we have a country code, use it to get news FROM that country
      let apiUrl
      if (countryCode) {
        apiUrl = `https://gnews.io/api/v4/top-headlines?country=${countryCode}&lang=en&max=5&apikey=${GNEWS_API_KEY}`
      } else {
        // Fallback to searching for news ABOUT the country
        apiUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(country)}&lang=en&max=5&apikey=${GNEWS_API_KEY}`
      }

      const response = await fetch(apiUrl)
      if (!response.ok) {
        throw new Error(`News API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("News data received:", data)
      return {
        articles: data.articles || [],
        fromCountry: !!countryCode,
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
        return {
          articles: data.articles || [],
          fromCountry: false,
        }
      } catch (altError) {
        console.error("Alternative news approach failed:", altError)

        // Return mock data as a last resort
        return {
          articles: [
            {
              title: `News about ${country}`,
              description: `We couldn't fetch real news for ${country} at the moment. This is a placeholder article.`,
              url: "#",
              image: `https://via.placeholder.com/300x200?text=${encodeURIComponent(country)}`,
              publishedAt: new Date().toISOString(),
              source: { name: "TerraConnect" },
            },
            {
              title: `${country} information`,
              description: `Learn more about ${country} by clicking the Details button in the country popup.`,
              url: "#",
              publishedAt: new Date().toISOString(),
              source: { name: "TerraConnect" },
            },
          ],
          fromCountry: false,
          isMock: true,
        }
      }
    }
  }

  document.addEventListener("countrySelected", async (e) => {
    const countryName = e.detail.country
    if (!countryName) return

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
                <h2>${headerText}</h2>
                ${result.isMock ? '<p class="mock-notice">Real news data is currently unavailable.</p>' : ""}
                ${newsHTML}
            `
    }
  })
}
