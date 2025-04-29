// === news.js (Fixed & Improved) ===

// Using Gnews API with your API key
const GNEWS_API_KEY = "f722aee7a01c3aadf85deec3f2069229"

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

    // Try alternative free news API if GNews fails
    try {
      console.log("Trying alternative news API...")
      const countryData = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=true`,
      )
      const countryJson = await countryData.json()
      const countryCode = countryJson[0].cca2.toLowerCase()
      const response = await fetch(
        `https://api.mediastack.com/v1/news?access_key=YOUR_MEDIASTACK_KEY&countries=${countryCode}&limit=5`,
      )
      if (!response.ok) throw new Error("Alternative API failed")
      const data = await response.json()
      return {
        articles: data.data || [],
        fromCountry: true,
      }
    } catch (altError) {
      console.error("Alternative news API failed:", altError)
      return null
    }
  }
}

function initNewsFeature() {
  const newsContent = document.getElementById("newsContent")
  if (!newsContent) {
    console.error("#newsContent element not found.")
    return
  }

  document.addEventListener("countrySelected", async (e) => {
    const countryName = e.detail.country
    if (!countryName) return

    newsContent.innerHTML = "<p>Loading news...</p>"
    const result = await fetchCountryNews(countryName)

    if (!result) {
      newsContent.innerHTML = `<p>Error loading news. Please try again later.</p>`
    } else if (result.articles.length === 0) {
      newsContent.innerHTML = `<p>No recent news found for <strong>${countryName}</strong>.</p>`
    } else {
      const newsHTML = result.articles
        .map(
          (article) => `
        <div class="news-article">
          <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
          <p>${article.description ? article.description : "No description available."}</p>
          <small>Source: ${article.source?.name || "Unknown"} | ${new Date(article.publishedAt).toLocaleDateString()}</small>
        </div>
      `,
        )
        .join("")

      newsContent.innerHTML = `
        <h2>${result.fromCountry ? "Latest News from" : "News about"} ${countryName}</h2>
        ${newsHTML}
      `
    }
  })
}

// Initialize the news feature when the DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNewsFeature)
} else {
  initNewsFeature()
}
