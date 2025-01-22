// Initialize the map
const map = L.map('map').setView([20, 0], 2); // Centered at lat=20, lng=0, zoom=2

// Add a tile layer (e.g., OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Add a GeoJSON layer for countries (you'll need a GeoJSON file)
let geojsonLayer;

// Load country boundaries and set up interactivity
fetch('path/to/countries.geojson') // Replace with the path to your GeoJSON file
    .then(response => response.json())
    .then(data => {
        geojsonLayer = L.geoJSON(data, {
            style: {
                color: "#3388ff", // Border color
                weight: 1,
                fillOpacity: 0.2 // Slight transparency
            },
            onEachFeature: onEachFeature // Set up event handlers
        }).addTo(map);
    })
    .catch(error => console.error('Error loading GeoJSON:', error));

// Define interactivity for each country
function onEachFeature(feature, layer) {
    // Add hover effect
    layer.on('mouseover', function () {
        this.setStyle({
            fillOpacity: 0.5
        });
    });

    // Reset style on mouseout
    layer.on('mouseout', function () {
        geojsonLayer.resetStyle(this);
    });

    // Add click event to fetch news and facts
    layer.on('click', function () {
        const countryName = feature.properties.name; // Assuming your GeoJSON has 'name' for country
        showCountryInfo(countryName);
    });
}

// Fetch and display country-specific data (stub function)
function showCountryInfo(countryName) {
    // Display country name (replace with modal or sidebar logic)
    console.log(`Clicked on: ${countryName}`);

    // TODO: Call APIs for news and facts
    // fetchNews(countryName);
    // fetchFacts(countryName);
}
