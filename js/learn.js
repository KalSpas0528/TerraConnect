// === learn.js - Handles educational learning functionality for children ===

document.addEventListener("DOMContentLoaded", initLearnMode);

function initLearnMode() {
  const learnBtn = document.getElementById("learnModeBtn");
  const learnModal = document.getElementById("learnModal");

  if (learnBtn) {
    learnBtn.addEventListener("click", openLearnModal);
  }

  const modalContent = learnModal.querySelector(".modal-content");
  makeModalDraggable(modalContent);

  const modalHeader = learnModal.querySelector(".modal-header");
  const minimizeBtn = document.createElement("button");
  minimizeBtn.className = "minimize-button";
  minimizeBtn.innerHTML = '<i class="fas fa-minus"></i>';
  minimizeBtn.title = "Minimize";

  const closeButton = modalHeader.querySelector(".close-button");
  modalHeader.insertBefore(minimizeBtn, closeButton);

  minimizeBtn.addEventListener("click", toggleMinimizeModal);
  document.getElementById("closeLearnModal").addEventListener("click", closeLearnModal);

  window.addEventListener("click", (e) => {
    if (e.target === learnModal) {
      closeLearnModal();
    }
  });

  const checkDataInterval = setInterval(() => {
    if (window.countryData && window.countryData.length > 0) {
      initExploreMode();
      clearInterval(checkDataInterval);
    }
  }, 1000);

  if (window.learnTargetCountry) {
    const targetCountry = window.learnTargetCountry;
    window.learnTargetCountry = null;

    const waitForCountryData = setInterval(() => {
      if (window.countryData && window.countryData.length > 0) {
        clearInterval(waitForCountryData);

        const country = window.countryData.find(
          (c) => c.name.common === targetCountry
        );
        if (country) {
          showCountryInLearnMode(country);
        } else {
          initExploreMode();
        }
      }
    }, 500);
  }

  function makeModalDraggable(element) {
    let pos1 = 0,
      pos2 = 0,
      pos3 = 0,
      pos4 = 0;
    const header = element.querySelector(".modal-header");

    if (header) {
      header.style.cursor = "move";
      header.onmousedown = dragMouseDown;
    } else {
      element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = element.offsetTop - pos2 + "px";
      element.style.left = element.offsetLeft - pos1 + "px";
      element.style.position = "absolute";
      element.style.margin = "0";
      element.style.transform = "none";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  function toggleMinimizeModal() {
    const modalBody = learnModal.querySelector(".modal-body");
    const modalFooter = learnModal.querySelector(".modal-footer");

    if (modalBody.style.display === "none") {
      modalBody.style.display = "block";
      if (modalFooter) modalFooter.style.display = "block";
      minimizeBtn.innerHTML = '<i class="fas fa-minus"></i>';
      minimizeBtn.title = "Minimize";
    } else {
      modalBody.style.display = "none";
      if (modalFooter) modalFooter.style.display = "none";
      minimizeBtn.innerHTML = '<i class="fas fa-plus"></i>';
      minimizeBtn.title = "Maximize";
    }
  }
}

function openLearnModal() {
  const learnModal = document.getElementById("learnModal");
  if (learnModal) {
    learnModal.style.display = "block";
    if (!window.learnTargetCountry) {
      initExploreMode();
    }
  }
}

function closeLearnModal() {
  const learnModal = document.getElementById("learnModal");
  if (learnModal) {
    learnModal.style.display = "none";
  }
}

function getRandomCountries(count) {
  if (!window.countryData || window.countryData.length === 0) {
    return [];
  }

  const countries = [...window.countryData];
  const result = [];

  for (let i = 0; i < count && countries.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * countries.length);
    result.push(countries.splice(randomIndex, 1)[0]);
  }

  return result;
}

function showCountryInLearnMode(country) {
  if (!country) return;
  updateLearnUI(country);
}

function updateLearnUI(country) {
  const modalBody = document.querySelector("#learnModal .modal-body");

  modalBody.innerHTML = `
    <div class="learn-container">
      <div class="learn-header">
        <h3>Let's Explore: ${country.name.common}</h3>
        <button id="exploreNewCountry" class="primary-button">
          <i class="fas fa-globe"></i> Explore Another Country
        </button>
        <button id="showOnMap" class="secondary-button">
          <i class="fas fa-map"></i> Show on Map
        </button>
      </div>
      <div class="learn-content">
        <div class="learn-flag-container">
          <img src="${country.flags.png}" alt="Flag of ${country.name.common}" class="learn-flag">
          <p class="learn-flag-caption">This is the flag of ${country.name.common}!</p>
        </div>
        <div class="learn-facts">
          <div class="learn-fact">
            <i class="fas fa-map-marker-alt"></i>
            <p>${country.name.common} is located in <strong>${country.region || "the world"}</strong>.</p>
          </div>
          <div class="learn-fact">
            <i class="fas fa-city"></i>
            <p>The capital city is <strong>${country.capital ? country.capital[0] : "unknown"}</strong>.</p>
          </div>
          <div class="learn-fact">
            <i class="fas fa-users"></i>
            <p>About <strong>${(country.population / 1000000).toFixed(1)} million</strong> people live there.</p>
          </div>
          ${
            country.languages
              ? `<div class="learn-fact">
                  <i class="fas fa-comments"></i>
                  <p>They speak <strong>${Object.values(country.languages).join(", ")}</strong> there.</p>
                </div>`
              : ""
          }
        </div>
      </div>
    </div>
  `;

  document.getElementById("exploreNewCountry").addEventListener("click", () => {
    const next = getRandomCountries(1);
    if (next.length > 0) showCountryInLearnMode(next[0]);
  });

  document.getElementById("showOnMap").addEventListener("click", () => {
    zoomToCountryOnMap(country);
  });
}

function standardizeCountryName(name) {
  const map = {
    "United States of America": "United States",
    USA: "United States",
    UK: "United Kingdom",
    "Russian Federation": "Russia",
    "South Korea": "Korea, Republic of",
    "North Korea": "Korea, Democratic People's Republic of"
  };
  return map[name] || name;
}

function zoomToCountryOnMap(country) {
  if (!window.map || !window.geojsonLayer || !window.countryLayers) return;

  const name = standardizeCountryName(country.name.common);
  const matchedKey = Object.keys(window.countryLayers).find(
    (key) => key.toLowerCase().trim() === name.toLowerCase().trim()
  );

  const layer = matchedKey ? window.countryLayers[matchedKey] : null;

  if (layer && typeof layer.getBounds === "function") {
    window.geojsonLayer.resetStyle();
    layer.setStyle({ color: "#e74c3c", weight: 4, fillOpacity: 0.4 });
    window.map.fitBounds(layer.getBounds(), { padding: [60, 60], maxZoom: 5 });
    setTimeout(() => window.geojsonLayer.resetStyle(layer), 3000);
  } else {
    console.warn("Could not find map layer for:", name);
  }
}

function initExploreMode() {
  const countries = getRandomCountries(1);
  if (countries.length > 0) {
    showCountryInLearnMode(countries[0]);
  } else {
    console.warn("No country data available for Learn Mode.");
  }
}
