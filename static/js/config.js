// API Configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const API_ENDPOINTS = {
    categories: `${API_BASE_URL}/categories/`,
    search: `${API_BASE_URL}/search/`,
    venueDetail: (id) => `${API_BASE_URL}/venues/${id}/`,
    searchHistory: `${API_BASE_URL}/search-history/`,
};

// Map Configuration
const MAP_CONFIG = {
    defaultCenter: [5.6037, -0.1870], // Accra, Ghana
    defaultZoom: 12,
    maxZoom: 18,
    tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

// Category icon mapping (matching backend)
const CATEGORY_ICONS = {
    'restaurant': '🍽️',
    'cafe': '☕',
    'entertainment': '🎪',
    'lounge': '🛋️',
    'cinema': '🎬',
    'bar': '🍺'
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_ENDPOINTS, MAP_CONFIG, CATEGORY_ICONS };
}