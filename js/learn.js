// === learn.js - Handles country learning functionality ===

document.addEventListener("DOMContentLoaded", initLearnMode)

function initLearnMode() {
  // Get the learn button that's already in the HTML
  const learnBtn = document.getElementById("learnModeBtn")

  if (learnBtn) {
    learnBtn.addEventListener("click", openLearnModal)
  }

  // Initialize learn modal (already in HTML)
  const learnModal = document.getElementById("learnModal")

  // Add event listeners
  document.getElementById("closeLearnModal").addEventListener("click", closeLearnModal)

  // Tab switching
  const tabButtons = document.querySelectorAll(".learn-tab-button")
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      tabButtons.forEach((btn) => btn.classList.remove("active"))

      // Add active class to clicked button
      button.classList.add("active")

      // Hide all tab content
      document.querySelectorAll(".learn-tab-content").forEach((content) => {
        content.classList.remove("active")
      })

      // Show selected tab content
      const tabId = button.getAttribute("data-tab") + "-tab"
      document.getElementById(tabId).classList.add("active")

      // Initialize content for the selected tab
      if (tabId === "flashcards-tab") {
        initFlashcards()
      } else if (tabId === "capitals-tab") {
        initCapitalsQuiz()
      } else if (tabId === "flags-tab") {
        initFlagsQuiz()
      }
    })
  })

  // Flashcard functionality
  document.getElementById("show-answer").addEventListener("click", () => {
    document.querySelector(".flashcard-front").classList.add("hidden")
    document.querySelector(".flashcard-back").classList.remove("hidden")
  })

  document.getElementById("next-flashcard").addEventListener("click", () => {
    document.querySelector(".flashcard-front").classList.remove("hidden")
    document.querySelector(".flashcard-back").classList.add("hidden")
    initFlashcards()
  })

  // Next buttons for quizzes
  document.getElementById("next-capital").addEventListener("click", initCapitalsQuiz)
  document.getElementById("next-flag").addEventListener("click", initFlagsQuiz)

  // Initialize with flashcards when country data is available
  const checkDataInterval = setInterval(() => {
    if (window.countryData && window.countryData.length > 0) {
      initFlashcards()
      clearInterval(checkDataInterval)
    }
  }, 1000)
}

function openLearnModal() {
  const learnModal = document.getElementById("learnModal")
  if (learnModal) {
    learnModal.style.display = "block"

    // Initialize content based on active tab
    const activeTab = document.querySelector(".learn-tab-button.active")
    if (activeTab) {
      const tabId = activeTab.getAttribute("data-tab") + "-tab"
      if (tabId === "flashcards-tab") {
        initFlashcards()
      } else if (tabId === "capitals-tab") {
        initCapitalsQuiz()
      } else if (tabId === "flags-tab") {
        initFlagsQuiz()
      }
    } else {
      initFlashcards()
    }
  }
}

function closeLearnModal() {
  const learnModal = document.getElementById("learnModal")
  if (learnModal) {
    learnModal.style.display = "none"
  }
}

// Get random countries for quizzes
function getRandomCountries(count) {
  if (!window.countryData || window.countryData.length === 0) {
    return []
  }

  const countries = [...window.countryData]
  const result = []

  for (let i = 0; i < count && countries.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * countries.length)
    result.push(countries.splice(randomIndex, 1)[0])
  }

  return result
}

// Flashcards
function initFlashcards() {
  if (!window.countryData || window.countryData.length === 0) {
    document.getElementById("flashcard-question").textContent = "Loading country data..."
    return
  }

  const randomCountry = getRandomCountries(1)[0]

  // Set question
  const questionTypes = [
    `What is the capital of ${randomCountry.name.common}?`,
    `${randomCountry.name.common} is located in which continent?`,
    `What is the population of ${randomCountry.name.common}?`,
    `What is the official language of ${randomCountry.name.common}?`,
    `What currency is used in ${randomCountry.name.common}?`,
  ]

  const randomQuestionIndex = Math.floor(Math.random() * questionTypes.length)
  const question = questionTypes[randomQuestionIndex]
  document.getElementById("flashcard-question").textContent = question

  // Set answer
  let answer = ""
  switch (randomQuestionIndex) {
    case 0: // Capital
      answer = randomCountry.capital ? randomCountry.capital[0] : "No official capital"
      break
    case 1: // Continent
      answer = randomCountry.region || "Unknown"
      break
    case 2: // Population
      answer = randomCountry.population ? randomCountry.population.toLocaleString() : "Unknown"
      break
    case 3: // Language
      answer = randomCountry.languages ? Object.values(randomCountry.languages).join(", ") : "No official language data"
      break
    case 4: // Currency
      answer = randomCountry.currencies
        ? Object.values(randomCountry.currencies)
            .map((c) => `${c.name} (${c.symbol})`)
            .join(", ")
        : "No official currency data"
      break
  }

  document.getElementById("flashcard-answer").textContent = answer
}

// Capitals Quiz
function initCapitalsQuiz() {
  if (!window.countryData || window.countryData.length === 0) {
    document.getElementById("capital-question").textContent = "Loading country data..."
    return
  }

  // Get 4 random countries
  const quizCountries = getRandomCountries(4)
  const correctCountry = quizCountries[0]

  // Set question
  document.getElementById("capital-question").textContent = `What is the capital of ${correctCountry.name.common}?`

  // Create options
  const optionsContainer = document.getElementById("capital-options")
  optionsContainer.innerHTML = ""

  // Shuffle options
  const shuffledCountries = [...quizCountries].sort(() => Math.random() - 0.5)

  shuffledCountries.forEach((country) => {
    const capital = country.capital ? country.capital[0] : "No official capital"
    const option = document.createElement("button")
    option.className = "capital-option"
    option.textContent = capital

    option.addEventListener("click", () => {
      // Disable all options
      document.querySelectorAll(".capital-option").forEach((btn) => {
        btn.disabled = true
      })

      const feedback = document.getElementById("capital-feedback")
      const nextButton = document.getElementById("next-capital")

      if (country === correctCountry) {
        option.classList.add("correct-option")
        feedback.textContent = "Correct!"
        feedback.className = "feedback success"
      } else {
        option.classList.add("wrong-option")

        // Highlight correct answer
        document.querySelectorAll(".capital-option").forEach((btn) => {
          if (btn.textContent === (correctCountry.capital ? correctCountry.capital[0] : "No official capital")) {
            btn.classList.add("correct-option")
          }
        })

        feedback.textContent = "Incorrect. Try again!"
        feedback.className = "feedback error"
      }

      nextButton.classList.remove("hidden")
    })

    optionsContainer.appendChild(option)
  })

  // Reset feedback and next button
  const feedback = document.getElementById("capital-feedback")
  feedback.textContent = ""
  feedback.className = "feedback"

  document.getElementById("next-capital").classList.add("hidden")
}

// Flags Quiz
function initFlagsQuiz() {
  if (!window.countryData || window.countryData.length === 0) {
    document.getElementById("flag-image").alt = "Loading country data..."
    return
  }

  // Get 4 random countries
  const quizCountries = getRandomCountries(4)
  const correctCountry = quizCountries[0]

  // Set flag image
  const flagImage = document.getElementById("flag-image")
  flagImage.src = correctCountry.flags.png
  flagImage.alt = `Flag of ${correctCountry.name.common}`

  // Create options
  const optionsContainer = document.getElementById("flag-options")
  optionsContainer.innerHTML = ""

  // Shuffle options
  const shuffledCountries = [...quizCountries].sort(() => Math.random() - 0.5)

  shuffledCountries.forEach((country) => {
    const option = document.createElement("button")
    option.className = "flag-option"
    option.textContent = country.name.common

    option.addEventListener("click", () => {
      // Disable all options
      document.querySelectorAll(".flag-option").forEach((btn) => {
        btn.disabled = true
      })

      const feedback = document.getElementById("flag-feedback")
      const nextButton = document.getElementById("next-flag")

      if (country === correctCountry) {
        option.classList.add("correct-option")
        feedback.textContent = "Correct!"
        feedback.className = "feedback success"
      } else {
        option.classList.add("wrong-option")

        // Highlight correct answer
        document.querySelectorAll(".flag-option").forEach((btn) => {
          if (btn.textContent === correctCountry.name.common) {
            btn.classList.add("correct-option")
          }
        })

        feedback.textContent = "Incorrect. Try again!"
        feedback.className = "feedback error"
      }

      nextButton.classList.remove("hidden")
    })

    optionsContainer.appendChild(option)
  })

  // Reset feedback and next button
  const feedback = document.getElementById("flag-feedback")
  feedback.textContent = ""
  feedback.className = "feedback"

  document.getElementById("next-flag").classList.add("hidden")
}

// Window click to close modal
window.addEventListener("click", (e) => {
  const learnModal = document.getElementById("learnModal")
  if (e.target === learnModal) {
    closeLearnModal()
  }
})



