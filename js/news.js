document.addEventListener("DOMContentLoaded", () => {
    const loadNewsBtn = document.getElementById("loadNewsBtn");
    const newsContent = document.getElementById("newsContent");
  
    loadNewsBtn.addEventListener("click", () => {
      // Simulate fetching news using a placeholder array
      const newsArticles = [
        {
          title: "News Article 1",
          content: "This is a placeholder for news article 1. More details to come soon."
        },
        {
          title: "News Article 2",
          content: "This is a placeholder for news article 2. Stay tuned for further updates."
        },
        {
          title: "News Article 3",
          content: "This is a placeholder for news article 3. Check back later for more info."
        }
      ];
  
      // Clear previous news content
      newsContent.innerHTML = "";
      newsArticles.forEach(article => {
        const articleDiv = document.createElement("div");
        articleDiv.className = "news-article";
        articleDiv.innerHTML = `<h3>${article.title}</h3><p>${article.content}</p>`;
        newsContent.appendChild(articleDiv);
      });
    });
  });
  