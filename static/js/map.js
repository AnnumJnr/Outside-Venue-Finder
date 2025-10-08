// Map and markers storage
let map = null;
let markers = [];
let markerCluster = null;

/**
 * Initialize Leaflet map
 */
function initializeMap() {
    // Check if map container exists
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Map container not found!');
        return;
    }

    // Remove existing map if any
    if (map) {
        map.remove();
    }

    // Create map centered on Accra
    map = L.map('map').setView(MAP_CONFIG.defaultCenter, MAP_CONFIG.defaultZoom);

    // Add OpenStreetMap tiles
    L.tileLayer(MAP_CONFIG.tileLayer, {
        maxZoom: MAP_CONFIG.maxZoom,
        attribution: MAP_CONFIG.attribution
    }).addTo(map);

    console.log('✅ Map initialized');
}

/**
 * Clear all markers from map
 */
function clearMarkers() {
    markers.forEach(marker => {
        map.removeLayer(marker);
    });
    markers = [];
}

/**
 * Add markers for venues
 * @param {Array} venues - Array of venue objects
 */
function addVenueMarkers(venues) {
    clearMarkers();

    if (!venues || venues.length === 0) {
        console.log('No venues to display');
        return;
    }

    console.log(`Adding ${venues.length} markers to map`);

    const bounds = [];

    venues.forEach(venue => {
        const lat = parseFloat(venue.latitude);
        const lng = parseFloat(venue.longitude);

        // Validate coordinates
        if (isNaN(lat) || isNaN(lng)) {
            console.warn(`Invalid coordinates for ${venue.name}`);
            return;
        }

        // Create marker
        const marker = L.marker([lat, lng], {
            title: venue.name
        });

        // Create popup content
        const popupContent = `
            <div class="venue-popup">
                <h3 style="margin: 0 0 8px 0; font-size: 1.1rem;">${venue.name}</h3>
                <p style="margin: 4px 0; font-size: 0.9rem;">
                    <strong>${venue.category_icon || '📍'} ${venue.category_name}</strong>
                </p>
                <p style="margin: 4px 0; font-size: 0.85rem;">
                    📍 ${venue.area ? venue.area + ', ' : ''}${venue.city}
                </p>
                <p style="margin: 4px 0; font-size: 0.85rem;">
                    💰 ${venue.price_range} • ⭐ ${venue.rating || 'N/A'}
                </p>
                <button 
                    onclick="showVenueDetails(${venue.id})" 
                    style="margin-top: 8px; padding: 6px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 15px; cursor: pointer; font-size: 0.85rem;">
                    View Details
                </button>
            </div>
        `;

        marker.bindPopup(popupContent);

        // Add click event
        marker.on('click', function() {
            // Highlight corresponding venue card
            highlightVenueCard(venue.id);
        });

        // Add to map and array
        marker.addTo(map);
        markers.push(marker);
        bounds.push([lat, lng]);
    });

    // Fit map to show all markers
    if (bounds.length > 0) {
        map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 14
        });
    }

    console.log(`✅ Added ${markers.length} markers`);
}

/**
 * Highlight a venue card in the list
 * @param {number} venueId - Venue ID
 */
function highlightVenueCard(venueId) {
    // Remove previous highlights
    document.querySelectorAll('.venue-card').forEach(card => {
        card.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        card.style.background = 'rgba(255, 255, 255, 0.1)';
    });

    // Highlight selected card
    const card = document.querySelector(`[data-venue-id="${venueId}"]`);
    if (card) {
        card.style.borderColor = '#667eea';
        card.style.background = 'rgba(255, 255, 255, 0.15)';
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Focus map on specific venue
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 */
function focusOnVenue(lat, lng) {
    if (map) {
        map.setView([lat, lng], 16, {
            animate: true,
            duration: 1
        });

        // Find and open popup for this location
        markers.forEach(marker => {
            const markerLatLng = marker.getLatLng();
            if (Math.abs(markerLatLng.lat - lat) < 0.0001 && 
                Math.abs(markerLatLng.lng - lng) < 0.0001) {
                marker.openPopup();
            }
        });
    }
}

// Initialize map when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, checking for map container...');
    
    // Only initialize if map container exists
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        // Small delay to ensure proper rendering
        setTimeout(initializeMap, 100);
    }
});