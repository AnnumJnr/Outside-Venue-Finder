// Map and markers storage
let map = null;
let markers = [];
let markerCluster = null;

/**
 * Initialize Leaflet map
 */
function initializeMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('Map container not found!');
        return;
    }

    // Remove existing map instance if re-initializing
    if (map) {
        map.remove();
    }

    // Create map centered on Accra
    map = L.map('map', {
        zoomControl: true,
        preferCanvas: true,
        attributionControl: true,
    }).setView(MAP_CONFIG.defaultCenter, MAP_CONFIG.defaultZoom);

    // Add OpenStreetMap tiles with fallback & error handling
    const tileLayer = L.tileLayer(MAP_CONFIG.tileLayer, {
        maxZoom: MAP_CONFIG.maxZoom,
        attribution: MAP_CONFIG.attribution,
        detectRetina: true,
        crossOrigin: true
    });

    // Retry tiles that fail to load
    tileLayer.on('tileerror', function(e) {
        console.warn('Tile load error:', e.coords);
        setTimeout(() => e.tile.src = e.tile.src, 1000); // retry once
    });

    tileLayer.addTo(map);

    // Fix map rendering after it fully loads
    map.whenReady(() => {
        setTimeout(() => {
            map.invalidateSize();
            console.log('✅ Map fully initialized and validated');
        }, 300);
    });
}

/**
 * Fix map display issues (gray tiles)
 */
function fixMapDisplay() {
    if (!map) return;

    // Use requestAnimationFrame for smoother invalidation
    requestAnimationFrame(() => {
        map.invalidateSize({ animate: true });
        console.log('✅ Map display fixed');
    });
}

/**
 * Clear all markers
 */
function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
}

/**
 * Add markers for venues
 */
function addVenueMarkers(venues) {
    clearMarkers();
    if (!venues || venues.length === 0) {
        console.log('No venues to display');
        return;
    }

    const bounds = [];

    venues.forEach(venue => {
        const lat = parseFloat(venue.latitude);
        const lng = parseFloat(venue.longitude);
        if (isNaN(lat) || isNaN(lng)) {
            console.warn(`Invalid coordinates for ${venue.name}`);
            return;
        }

        const marker = L.marker([lat, lng], { title: venue.name });
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
                <button onclick="showVenueDetails(${venue.id})"
                    style="margin-top: 8px; padding: 6px 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white; border: none; border-radius: 15px; cursor: pointer; font-size: 0.85rem;">
                    View Details
                </button>
            </div>
        `;

        marker.bindPopup(popupContent);
        marker.on('click', () => highlightVenueCard(venue.id));
        marker.addTo(map);

        markers.push(marker);
        bounds.push([lat, lng]);
    });

    if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }

    // Fix map display once markers added
    setTimeout(fixMapDisplay, 400);
}

/**
 * Highlight venue card
 */
function highlightVenueCard(venueId) {
    document.querySelectorAll('.venue-card').forEach(card => {
        card.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        card.style.background = 'rgba(255, 255, 255, 0.1)';
    });

    const card = document.querySelector(`[data-venue-id="${venueId}"]`);
    if (card) {
        card.style.borderColor = '#667eea';
        card.style.background = 'rgba(255, 255, 255, 0.15)';
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Focus map on a venue
 */
function focusOnVenue(lat, lng) {
    if (!map) return;

    map.setView([lat, lng], 16, { animate: true, duration: 1 });

    markers.forEach(marker => {
        const pos = marker.getLatLng();
        if (Math.abs(pos.lat - lat) < 0.0001 && Math.abs(pos.lng - lng) < 0.0001) {
            marker.openPopup();
        }
    });
}

// Initialize map when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        setTimeout(() => {
            initializeMap();
            fixMapDisplay();
        }, 300);
    }
});

// Handle window resize or tab switch
window.addEventListener('resize', fixMapDisplay);
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') fixMapDisplay();
});
