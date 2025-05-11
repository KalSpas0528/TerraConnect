// === junior-explorer.js - Handles Junior Explorer mode functionality ===

document.addEventListener("DOMContentLoaded", initJuniorExplorer)

function initJuniorExplorer() {
  // Create the Junior Explorer toggle button
  const headerActions = document.querySelector(".header-actions")
  if (!headerActions) return

  const juniorExplorerBtn = document.createElement("button")
  juniorExplorerBtn.id = "juniorExplorerBtn"
  juniorExplorerBtn.className = "action-button"
  juniorExplorerBtn.innerHTML = '<i class="fas fa-child"></i> Junior Explorer'

  // Insert the button at the beginning of the header actions
  headerActions.insertBefore(juniorExplorerBtn, headerActions.firstChild)

  // Check if Junior Explorer mode was previously enabled
  const isJuniorExplorerEnabled = localStorage.getItem("juniorExplorerMode") === "true"

  // Set initial state
  if (isJuniorExplorerEnabled) {
    enableJuniorExplorer()
  }

  // Add click event listener
  juniorExplorerBtn.addEventListener("click", toggleJuniorExplorer)

  // Function to toggle Junior Explorer mode
  function toggleJuniorExplorer() {
    if (document.body.classList.contains("junior-explorer")) {
      disableJuniorExplorer()
    } else {
      enableJuniorExplorer()
    }
  }

  // Function to enable Junior Explorer mode
  function enableJuniorExplorer() {
    // Update button appearance
    juniorExplorerBtn.classList.add("active")
    juniorExplorerBtn.innerHTML = '<i class="fas fa-child"></i> Junior Explorer: ON'

    // Add class to body for CSS targeting
    document.body.classList.add("junior-explorer")

    // Save state to localStorage
    localStorage.setItem("juniorExplorerMode", "true")

    // Show notification
    showNotification("Junior Explorer mode enabled", "junior")
  }

  // Function to disable Junior Explorer mode
  function disableJuniorExplorer() {
    // Update button appearance
    juniorExplorerBtn.classList.remove("active")
    juniorExplorerBtn.innerHTML = '<i class="fas fa-child"></i> Junior Explorer'

    // Remove class from body
    document.body.classList.remove("junior-explorer")

    // Save state to localStorage
    localStorage.setItem("juniorExplorerMode", "false")

    // Show notification
    showNotification("Junior Explorer mode disabled", "adult")
  }

  // Function to check if Junior Explorer mode is enabled - make it globally available
  window.isJuniorExplorerEnabled = () => document.body.classList.contains("junior-explorer")

  // Function to show notification
  function showNotification(message, type) {
    // Remove any existing notification
    const existingNotification = document.querySelector(".notification")
    if (existingNotification) {
      existingNotification.remove()
    }

    // Create notification element
    const notification = document.createElement("div")
    notification.className = `notification ${type}-notification`

    // Create notification content
    const content = document.createElement("div")
    content.className = "notification-content"

    // Add icon based on type
    const icon = document.createElement("i")
    icon.className = type === "junior" ? "fas fa-child" : "fas fa-user"
    content.appendChild(icon)

    // Add message
    const text = document.createElement("p")
    text.textContent = message
    content.appendChild(text)

    notification.appendChild(content)
    document.body.appendChild(notification)

    // Show notification
    setTimeout(() => {
      notification.classList.add("show")
    }, 10)

    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove("show")
      setTimeout(() => {
        notification.remove()
      }, 300)
    }, 3000)
  }
}



