// Store current search results
let currentVenues = [];
let selectedCategory = '';
let selectedCategoryIcon = '';
let selectedCategoryName = '';

/**
 * Initialize search functionality
 */
function initializeSearch() {
    console.log('Initializing search...');

    // Category card clicks
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            selectedCategory = this.dataset.category;
            selectedCategoryIcon = this.dataset.icon;
            selectedCategoryName = this.querySelector('.category-name').textContent;

            openLocationModal();
        });
    });

    // Search button click
    const searchBtn = document.getElementById('search-location-btn');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    // Enter key in location input
    const locationInput = document.getElementById('location-input');
    if (locationInput) {
        locationInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // Back button
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            document.getElementById('results-section').style.display = 'none';
            document.querySelector('.category-section').scrollIntoView({ behavior: 'smooth' });
        });
    }

    console.log('✅ Search initialized');
}

/**
 * Open location input modal
 */
function openLocationModal() {
    const modal = document.getElementById('location-modal');
    const iconDisplay = document.getElementById('category-icon-display');
    const nameDisplay = document.getElementById('category-name-display');

    if (iconDisplay) iconDisplay.textContent = selectedCategoryIcon;
    if (nameDisplay) nameDisplay.textContent = selectedCategoryName;

    if (modal) {
        modal.classList.add('active');
        document.getElementById('location-input').focus();
    }
}

/**
 * Perform venue search
 */
async function performSearch() {
    const locationInput = document.getElementById('location-input');
    const location = locationInput.value.trim();

    if (!location) {
        alert('Please enter a location');
        return;
    }

    if (!selectedCategory) {
        alert('Please select a category first');
        return;
    }

    console.log(`Searching for ${selectedCategory} in ${location}...`);

    // Show loading state
    showLoadingState();

    // Parse location (city, area)
    let city = location;
    let area = '';

    if (location.includes(',')) {
        const parts = location.split(',').map(s => s.trim());
        city = parts[0];
        area = parts[1] || '';
    }

    // Build API URL
    let searchUrl = `${API_ENDPOINTS.search}?category=${selectedCategory}&city=${encodeURIComponent(city)}`;
    if (area) {
        searchUrl += `&area=${encodeURIComponent(area)}`;
    }

    try {
        const response = await fetch(searchUrl);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        currentVenues = data.results || [];

        console.log(`Found ${currentVenues.length} venues`);

        // Display results
        displaySearchResults(currentVenues, location);

        // Close modal
        document.getElementById('location-modal').classList.remove('active');

    } catch (error) {
        console.error('Search error:', error);
        alert('Error searching for venues. Please try again.');
        hideLoadingState();
    }
}

/**
 * Display search results
 */
function displaySearchResults(venues, location) {
    const resultsSection = document.getElementById('results-section');
    const resultsTitle = document.getElementById('results-title');
    const resultsInfo = document.getElementById('results-info');
    const venueList = document.getElementById('venue-list');

    // Update title
    if (resultsTitle) {
        resultsTitle.textContent = `${selectedCategoryName} in ${location}`;
    }

    // Update count
    if (resultsInfo) {
        resultsInfo.textContent = `Showing ${venues.length} ${venues.length === 1 ? 'place' : 'places'}`;
    }

    // Clear previous results
    if (venueList) {
        venueList.innerHTML = '';
    }

    if (venues.length === 0) {
        venueList.innerHTML = `
            <div style="text-align: center; padding: 40px; color: white;">
                <p style="font-size: 1.2rem; margin-bottom: 10px;">😔 No venues found</p>
                <p style="opacity: 0.8;">Try searching in a different location</p>
            </div>
        `;
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Fix map display even when no results
        fixMapDisplay();
        return;
    }

    // Create venue cards
    venues.forEach(venue => {
        const card = createVenueCard(venue);
        venueList.appendChild(card);
    });

    // Show results section FIRST
    resultsSection.style.display = 'block';
    
    // Then add markers (this will also fix the map)
    addVenueMarkers(venues);
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });

    hideLoadingState();
}

/**
 * Create venue card HTML element
 */
function createVenueCard(venue) {
    const card = document.createElement('div');
    card.className = 'venue-card';
    card.dataset.venueId = venue.id;

    const areaText = venue.area ? `${venue.area}, ` : '';
    const ratingText = venue.rating && venue.rating > 0 ? `⭐ ${venue.rating}` : '';

    card.innerHTML = `
        <div class="venue-name">${venue.name}</div>
        <div class="venue-details">
            📍 ${areaText}${venue.city} • 💰 ${venue.price_range} ${ratingText ? '• ' + ratingText : ''}
        </div>
    `;

    // Click event to show details
    card.addEventListener('click', function() {
        showVenueDetails(venue.id);
    });

    // Hover event to highlight on map
    card.addEventListener('mouseenter', function() {
        focusOnVenue(parseFloat(venue.latitude), parseFloat(venue.longitude));
    });

    return card;
}

/**
 * Show loading state
 */
function showLoadingState() {
    const searchBtn = document.getElementById('search-location-btn');
    if (searchBtn) {
        searchBtn.textContent = '🔍 Searching...';
        searchBtn.disabled = true;
    }
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    const searchBtn = document.getElementById('search-location-btn');
    if (searchBtn) {
        searchBtn.textContent = '🔍 Search';
        searchBtn.disabled = false;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeSearch);