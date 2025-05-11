// === theme.js - Handles dark/light theme switching ===

document.addEventListener("DOMContentLoaded", initTheme)

function initTheme() {
  // Check for saved theme preference or use system preference
  const savedTheme = localStorage.getItem("terraconnect-theme")
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches

  // Set initial theme
  if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add("dark-theme")
    updateThemeToggle(true)
  }

  // Create theme toggle button
  const headerActions = document.querySelector(".header-actions")
  if (headerActions) {
    const themeToggleBtn = document.createElement("button")
    themeToggleBtn.id = "themeToggleBtn"
    themeToggleBtn.className = "action-button"
    themeToggleBtn.title = "Toggle Dark/Light Mode"
    updateThemeToggle(document.documentElement.classList.contains("dark-theme"), themeToggleBtn)

    // Add to beginning of header actions
    if (headerActions.firstChild) {
      headerActions.insertBefore(themeToggleBtn, headerActions.firstChild)
    } else {
      headerActions.appendChild(themeToggleBtn)
    }

    // Add event listener
    themeToggleBtn.addEventListener("click", toggleTheme)
  }

  // Listen for system preference changes
  if (window.matchMedia) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem("terraconnect-theme")) {
        if (e.matches) {
          document.documentElement.classList.add("dark-theme")
        } else {
          document.documentElement.classList.remove("dark-theme")
        }
        updateThemeToggle(e.matches)
      }
    })
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark-theme")
  localStorage.setItem("terraconnect-theme", isDark ? "dark" : "light")
  updateThemeToggle(isDark)
}

function updateThemeToggle(isDark, button = document.getElementById("themeToggleBtn")) {
  if (!button) return

  button.innerHTML = isDark ? '<i class="fas fa-sun"></i> Light Mode' : '<i class="fas fa-moon"></i> Dark Mode'
}



