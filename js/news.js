// Using Gnews API (free tier)
async function fetchCountryNews(country) {
  try {
    const response = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(country)}&lang=en&max=5&apikey=f722aee7a01c3aadf85deec3f2069229`);
    const data = await response.json();
    return data.articles;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
}

// Update the map click handler to include news
document.addEventListener('DOMContentLoaded', () => {
  const newsContent = document.getElementById('newsContent');
  
  // Listen for country clicks
  document.addEventListener('countrySelected', async (e) => {
    const countryName = e.detail.country;
    
    if (countryName) {
      newsContent.innerHTML = '<p>Loading news...</p>';
      const articles = await fetchCountryNews(countryName);
      
      if (articles && articles.length > 0) {
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
      } else {
        newsContent.innerHTML = '<p>No news available for this country.</p>';
      }
    } else {
      newsContent.innerHTML = '<p>News not available for this country.</p>';
    }
  });
});