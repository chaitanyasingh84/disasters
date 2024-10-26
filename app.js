// Basic admin credentials
const adminUsername = 'admin';
const adminPassword = 'password';

// Data storage
let stations = loadStations(); // Load stations from localStorage on page load
let commodityTypes = loadCommodityTypes(); // Load commodity types from localStorage
let loggedIn = false;

// Login function
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === adminUsername && password === adminPassword) {
        loggedIn = true;
        localStorage.setItem('loggedIn', 'true');
        window.location.href = 'dashboard.html';
    } else {
        document.getElementById('error-message').textContent = 'Incorrect username or password';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('loggedIn');
    window.location.href = 'index.html';
}

// Check if admin is logged in when loading dashboard
if (window.location.pathname.includes('dashboard.html')) {
    if (!localStorage.getItem('loggedIn')) {
        window.location.href = 'index.html';
    }
}

// Initialize map
let map;
if (document.getElementById('map')) {
    map = L.map('map').setView([20.5937, 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Load and display saved stations on map
    Object.keys(stations).forEach(stationName => {
        const station = stations[stationName];
        addMarkerToMap(stationName, station.lat, station.lon);
    });

    updateStationSelect();
    updateStationList();
}

// Function to add a deployment station
function addDeploymentStation() {
    const stationName = document.getElementById('stationName').value;
    const lat = parseFloat(document.getElementById('stationLat').value);
    const lon = parseFloat(document.getElementById('stationLon').value);

    if (!stationName || isNaN(lat) || isNaN(lon)) {
        alert("Please provide valid station name and coordinates.");
        return;
    }

    // Check if station already exists
    if (stations[stationName]) {
        alert("A station with this name already exists.");
        return;
    }

    // Add new station to stations object
    stations[stationName] = { lat, lon, commodities: {} };
    console.log("Station added:", stationName, stations[stationName]);

    // Add marker to map
    addMarkerToMap(stationName, lat, lon);

    saveStations();
    updateStationSelect();
    updateStationList();

    // Clear input fields
    document.getElementById('stationName').value = '';
    document.getElementById('stationLat').value = '';
    document.getElementById('stationLon').value = '';
}

// Helper function to add a marker to the map
function addMarkerToMap(stationName, lat, lon) {
    const marker = L.marker([lat, lon]).addTo(map).bindPopup(`Station: ${stationName}`);
    stations[stationName].marker = marker;
    console.log("Marker added to map:", stationName, lat, lon);
}

// Function to update station dropdown
function updateStationSelect() {
    const stationSelect = document.getElementById('stationSelect');
    stationSelect.innerHTML = '<option value="">Select Station</option>';

    for (const station in stations) {
        const option = document.createElement('option');
        option.value = station;
        option.textContent = station;
        stationSelect.appendChild(option);
    }
    console.log("Station dropdown updated:", Object.keys(stations));
}

// Function to update station list display
function updateStationList() {
    const stationList = document.getElementById('stationList');
    stationList.innerHTML = '';

    for (const stationName in stations) {
        const station = stations[stationName];
        const listItem = document.createElement('li');
        listItem.innerHTML = `<b>${stationName}</b> (Lat: ${station.lat}, Lon: ${station.lon})`;

        const commoditiesList = document.createElement('ul');
        for (const commodity in station.commodities) {
            const commodityItem = document.createElement('li');
            const quantity = station.commodities[commodity];
            commodityItem.innerHTML = `${commodity}: ${quantity} `;

            const increaseButton = document.createElement('button');
            increaseButton.textContent = "+";
            increaseButton.onclick = () => changeQuantity(stationName, commodity, 1);

            const decreaseButton = document.createElement('button');
            decreaseButton.textContent = "-";
            decreaseButton.onclick = () => changeQuantity(stationName, commodity, -1);

            commodityItem.appendChild(increaseButton);
            commodityItem.appendChild(decreaseButton);
            commoditiesList.appendChild(commodityItem);
        }

        listItem.appendChild(commoditiesList);
        stationList.appendChild(listItem);
    }
    console.log("Station list updated:", Object.keys(stations));
}

// Function to add a commodity to a selected station
function addCommodity() {
    const stationName = document.getElementById('stationSelect').value;
    const commodityType = document.getElementById('commoditySelect').value;
    const quantity = parseInt(document.getElementById('commodityQuantity').value);

    if (!stationName || !commodityType || isNaN(quantity)) {
        alert("Please select a station and a commodity type, and provide a valid quantity.");
        return;
    }

    // Add or update the commodity quantity
    if (!stations[stationName].commodities[commodityType]) {
        stations[stationName].commodities[commodityType] = 0;
    }
    stations[stationName].commodities[commodityType] += quantity;

    saveStations();
    updateStationList();

    document.getElementById('commoditySelect').value = '';
    document.getElementById('commodityQuantity').value = 1;
}

// Function to change the quantity of a commodity at a specific station
function changeQuantity(stationName, commodity, amount) {
    if (stations[stationName] && stations[stationName].commodities[commodity] !== undefined) {
        stations[stationName].commodities[commodity] += amount;
        if (stations[stationName].commodities[commodity] < 0) {
            stations[stationName].commodities[commodity] = 0;
        }

        saveStations();
        updateStationList();
    }
}

// Save and load stations
function saveStations() {
    localStorage.setItem('stations', JSON.stringify(stations));
    console.log("Stations saved to localStorage:", stations);
}

function loadStations() {
    const savedStations = localStorage.getItem('stations');
    console.log("Loaded stations from localStorage:", savedStations);
    return savedStations ? JSON.parse(savedStations) : {};
}

// Save and load commodity types
function saveCommodityTypes() {
    localStorage.setItem('commodityTypes', JSON.stringify(commodityTypes));
}

function loadCommodityTypes() {
    const savedTypes = localStorage.getItem('commodityTypes');
    return savedTypes ? JSON.parse(savedTypes) : [];
}
