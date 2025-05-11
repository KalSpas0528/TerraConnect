// === bucket-list.js - Handles travel bucket list functionality ===

document.addEventListener("DOMContentLoaded", initBucketList)

function initBucketList() {
  // Initialize bucket list from localStorage
  const bucketList = JSON.parse(localStorage.getItem("terraconnect-bucket-list") || "[]")

  // Create bucket list UI
  createBucketListUI()

  // Add bucket list button to country popups
  document.addEventListener("countryPopupCreated", (e) => {
    const { countryName, popupElement } = e.detail

    // Find the buttons container
    const buttonsContainer = popupElement.querySelector(".country-popup-buttons")
    if (buttonsContainer) {
      // Create bucket list button
      const bucketListBtn = document.createElement("button")

      // Check if country is already in bucket list
      const isInBucketList = bucketList.includes(countryName)

      // Set button text and class
      updateBucketListButton(bucketListBtn, isInBucketList)

      // Add click event
      bucketListBtn.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleBucketListCountry(countryName, bucketListBtn)
      })

      // Add to buttons container
      buttonsContainer.appendChild(bucketListBtn)
    }
  })

  // Make functions available globally
  window.addToBucketList = addToBucketList
  window.removeFromBucketList = removeFromBucketList
}

function createBucketListUI() {
  // Create bucket list tab in sidebar
  const sidebarContent = document.querySelector(".sidebar-content")
  if (!sidebarContent) return

  // Create tab container if it doesn't exist
  let tabContainer = document.querySelector(".sidebar-tabs")
  if (!tabContainer) {
    tabContainer = document.createElement("div")
    tabContainer.className = "sidebar-tabs"
    sidebarContent.prepend(tabContainer)

    // Style the existing content
    const visitedList = document.getElementById("visited-list")
    const clearVisitedBtn = document.getElementById("clearVisitedBtn")

    if (visitedList && clearVisitedBtn) {
      const visitedContainer = document.createElement("div")
      visitedContainer.className = "tab-content visited-tab"
      visitedContainer.id = "visited-tab"

      // Move elements to the container
      visitedContainer.appendChild(visitedList)
      visitedContainer.appendChild(clearVisitedBtn)

      sidebarContent.appendChild(visitedContainer)
    }
  }

  // Create tabs
  tabContainer.innerHTML = `
    <button class="tab-button active" data-tab="visited-tab">
      <i class="fas fa-check-circle"></i> Visited
    </button>
    <button class="tab-button" data-tab="bucket-tab">
      <i class="fas fa-list"></i> Bucket List
    </button>
  `

  // Create bucket list container
  const bucketContainer = document.createElement("div")
  bucketContainer.className = "tab-content bucket-tab"
  bucketContainer.id = "bucket-tab"
  bucketContainer.style.display = "none"

  // Create bucket list
  const bucketListElem = document.createElement("ul")
  bucketListElem.id = "bucket-list"
  bucketContainer.appendChild(bucketListElem)

  // Create clear button
  const clearBucketBtn = document.createElement("button")
  clearBucketBtn.id = "clearBucketBtn"
  clearBucketBtn.className = "danger-button"
  clearBucketBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Clear Bucket List'
  clearBucketBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear your travel bucket list?")) {
      localStorage.removeItem("terraconnect-bucket-list")
      updateBucketList([])
    }
  })
  bucketContainer.appendChild(clearBucketBtn)

  // Add to sidebar
  sidebarContent.appendChild(bucketContainer)

  // Add tab switching functionality
  const tabButtons = document.querySelectorAll(".tab-button")
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      tabButtons.forEach((btn) => btn.classList.remove("active"))

      // Add active class to clicked button
      button.classList.add("active")

      // Hide all tab content
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.style.display = "none"
      })

      // Show selected tab content
      const tabId = button.getAttribute("data-tab")
      document.getElementById(tabId).style.display = "block"
    })
  })

  // Initialize bucket list
  updateBucketList(JSON.parse(localStorage.getItem("terraconnect-bucket-list") || "[]"))
}

function updateBucketList(countries) {
  const bucketListElem = document.getElementById("bucket-list")
  if (!bucketListElem) return

  if (countries.length > 0) {
    bucketListElem.innerHTML = countries
      .map(
        (country) => `
        <li>
          <i class="fas fa-globe"></i> ${country}
          <button class="remove-bucket-item" onclick="removeFromBucketList('${country}')">
            <i class="fas fa-times"></i>
          </button>
        </li>
      `,
      )
      .join("")
  } else {
    bucketListElem.innerHTML = "<li class='empty-list'>No countries in your bucket list yet</li>"
  }
}

function toggleBucketListCountry(countryName, buttonElement) {
  const bucketList = JSON.parse(localStorage.getItem("terraconnect-bucket-list") || "[]")
  const index = bucketList.indexOf(countryName)

  if (index === -1) {
    // Add to bucket list
    bucketList.push(countryName)
    updateBucketListButton(buttonElement, true)
  } else {
    // Remove from bucket list
    bucketList.splice(index, 1)
    updateBucketListButton(buttonElement, false)
  }

  // Save to localStorage
  localStorage.setItem("terraconnect-bucket-list", JSON.stringify(bucketList))

  // Update UI
  updateBucketList(bucketList)
}

function updateBucketListButton(button, isInList) {
  if (isInList) {
    button.innerHTML = '<i class="fas fa-list-check"></i> In Bucket List'
    button.classList.add("in-bucket-list")
  } else {
    button.innerHTML = '<i class="fas fa-list"></i> Add to Bucket List'
    button.classList.remove("in-bucket-list")
  }
}

function addToBucketList(countryName) {
  const bucketList = JSON.parse(localStorage.getItem("terraconnect-bucket-list") || "[]")

  if (!bucketList.includes(countryName)) {
    bucketList.push(countryName)
    localStorage.setItem("terraconnect-bucket-list", JSON.stringify(bucketList))
    updateBucketList(bucketList)
  }
}

function removeFromBucketList(countryName) {
  const bucketList = JSON.parse(localStorage.getItem("terraconnect-bucket-list") || "[]")
  const index = bucketList.indexOf(countryName)

  if (index !== -1) {
    bucketList.splice(index, 1)
    localStorage.setItem("terraconnect-bucket-list", JSON.stringify(bucketList))
    updateBucketList(bucketList)
  }
}



