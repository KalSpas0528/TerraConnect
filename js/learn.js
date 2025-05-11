// === learn.js - Handles country learning functionality ===

document.addEventListener("DOMContentLoaded", initLearnMode)

function initLearnMode() {
  // Create learn button in header
  const headerActions = document.querySelector(".header-actions")
  if (headerActions) {
    const learnBtn = document.createElement("button")
    learnBtn.id = "learnModeBtn"
    learnBtn.className = "action-button"
    learnBtn.innerHTML = '<i class="fas fa-graduation-cap"></i> Learn'

    // Insert before the game button
    const gameBtn = document.getElementById("startGameBtn")
    if (gameBtn) {
      headerActions.insertBefore(learnBtn, gameBtn)
    } else {
      headerActions.appendChild(learnBtn)
    }

    learnBtn.addEventListener("click", openLearnModal)
  }

  // Initialize learn modal
  const learnModal = document.createElement("div")
  learnModal.id = "learnModal"
  learnModal.className = "modal"
  learnModal.innerHTML = `
    <div class="modal-content learn-modal-content">
      <div class="modal-header">
        <h2>Learn About Countries</h2>
        <span id="closeLearnModal" class="close-button">&times;</span>
      </div>
      <div class="modal-body">
        <div class="learn-tabs">
          <button class="learn-tab-button active" data-tab="flashcards">Flashcards</button>
          <button class="learn-tab-button" data-tab="capitals">Capitals</button>
          <button class="learn-tab-button" data-tab="flags">Flags</button>
        </div>
        
        <div class="learn-content">
          <div id="flashcards-tab" class="learn-tab-content active">
            <div class="flashcard">
              <div class="flashcard-front">
                <div id="flashcard-question">Loading...</div>
                <button id="show-answer" class="secondary-button">Show Answer</button>
              </div>
              <div class="flashcard-back hidden">
                <div id="flashcard-answer">Loading...</div>
                <button id="next-flashcard" class="primary-button">Next Card</button>
              </div>
            </div>
          </div>
          
          <div id="capitals-tab" class="learn-tab-content">
            <div class="capitals-quiz">
              <h3 id="capital-question">What is the capital of...</h3>
              <div class="capital-options" id="capital-options">
                <button class="capital-option">Loading...</button>
              </div>
              <div id="capital-feedback" class="feedback"></div>
              <button id="next-capital" class="primary-button hidden">Next Question</button>
            </div>
          </div>
          
          <div id="flags-tab" class="learn-tab-content">
            <div class="flags-quiz">
              <h3>Which country does this flag belong to?</h3>
              <div class="flag-container">
                <img id="flag-image" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" alt="Country flag">
              </div>
              <div class="flag-options" id="flag-options">
                <button class="flag-option">Loading...</button>
              </div>
              <div id="flag-feedback" class="feedback"></div>
              <button id="next-flag" class="primary-button hidden">Next Flag</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `

  document.body.appendChild(learnModal)

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

  // Initialize with flashcards
  window.addEventListener("load", () => {
    if (window.countryData && window.countryData.length > 0) {
      initFlashcards()
    }
  })
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



