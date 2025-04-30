// === ui.js - Handles UI interactions and general app behavior ===


document.addEventListener("DOMContentLoaded", initUI)


function initUI() {
  // Initialize sidebar toggle
  const sidebarToggle = document.getElementById("sidebarToggle")
  const sidebar = document.querySelector(".sidebar")


  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("expanded")
      sidebarToggle.innerHTML = sidebar.classList.contains("expanded")
        ? '<i class="fas fa-chevron-left"></i>'
        : '<i class="fas fa-chevron-right"></i>'
    })


    // Expand sidebar by default
    sidebar.classList.add("expanded")
    sidebarToggle.innerHTML = '<i class="fas fa-chevron-left"></i>'
  }


  // Initialize news panel toggle
  const newsToggle = document.getElementById("newsToggle")
  const newsSection = document.querySelector(".news-section")


  if (newsToggle && newsSection) {
    newsToggle.addEventListener("click", () => {
      newsSection.classList.toggle("expanded")
      newsToggle.innerHTML = newsSection.classList.contains("expanded")
        ? '<i class="fas fa-chevron-right"></i>'
        : '<i class="fas fa-chevron-left"></i>'
    })
  }


  // Initialize country info modal close button
  const closeCountryInfoModal = document.getElementById("closeCountryInfoModal")
  const countryInfoModal = document.getElementById("countryInfoModal")


  if (closeCountryInfoModal && countryInfoModal) {
    closeCountryInfoModal.addEventListener("click", () => {
      countryInfoModal.style.display = "none"
    })


    window.addEventListener("click", (e) => {
      if (e.target === countryInfoModal) {
        countryInfoModal.style.display = "none"
      }
    })
  }


  // Handle Enter key in game input
  const gameGuessInput = document.getElementById("game-guess")
  const submitGuessBtn = document.getElementById("submit-guess-btn")


  if (gameGuessInput && submitGuessBtn) {
    gameGuessInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        submitGuessBtn.click()
      }
    })
  }


  // Add keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Escape key closes modals
    if (e.key === "Escape") {
      const modals = document.querySelectorAll(".modal")
      modals.forEach((modal) => {
        if (modal.style.display === "block") {
          modal.style.display = "none"
        }
      })
    }


    // S key toggles sidebar
    if (e.key === "s" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
      if (sidebar) {
        sidebar.classList.toggle("expanded")
        if (sidebarToggle) {
          sidebarToggle.innerHTML = sidebar.classList.contains("expanded")
            ? '<i class="fas fa-chevron-left"></i>'
            : '<i class="fas fa-chevron-right"></i>'
        }
      }
    }


    // N key toggles news panel
    if (e.key === "n" && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
      if (newsSection) {
        newsSection.classList.toggle("expanded")
        if (newsToggle) {
          newsToggle.innerHTML = newsSection.classList.contains("expanded")
            ? '<i class="fas fa-chevron-right"></i>'
            : '<i class="fas fa-chevron-left"></i>'
        }
      }
    }
  })


  // Handle Enter Map button
  const enterMapBtn = document.getElementById("enterMapBtn")
  const homepage = document.getElementById("homepage")


  if (enterMapBtn && homepage) {
    enterMapBtn.addEventListener("click", () => {
      homepage.style.display = "none"


      // Force map to recalculate its size
      if (window.map) {
        setTimeout(() => {
          window.map.invalidateSize()
        }, 200)
      }
    })
  }
}



