// news.js
const GNEWS_API_KEY = "f722aee7a01c3aadf85deec3f2069229";

async function fetchCountryNews(country) {
  try {
    const response = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(country)}&lang=en&max=5&apikey=${GNEWS_API_KEY}`);
    if (!response.ok) throw new Error("API error");
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error("News fetch failed:", error);
    return null;
  }
}

function initNewsFeature() {
  const newsContent = document.getElementById('newsContent');
  if (!newsContent) return;

  document.addEventListener('countrySelected', async (e) => {
    const countryName = e.detail.country;
    if (!countryName) return;

    newsContent.innerHTML = '<p>Loading news...</p>';
    const articles = await fetchCountryNews(countryName);

    if (!articles) {
      newsContent.innerHTML = `<p>Error loading news. Please try again later.</p>`;
    } else if (articles.length === 0) {
      newsContent.innerHTML = `<p>No recent news found for ${countryName}.</p>`;
    } else {
      const newsHTML = articles.map(article => `
        <div class="news-article">
          <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
          <p>${article.description || ''}</p>
          <small>Source: ${article.source.name} | ${new Date(article.publishedAt).toLocaleDateString()}</small>
        </div>
      `).join('');

      newsContent.innerHTML = `
        <h2>Latest News about ${countryName}</h2>
        ${newsHTML}
      `;
    }
  });
}

document.addEventListener("DOMContentLoaded", initNewsFeature);
