/**
 * Show venue details in modal
 * @param {number} venueId - Venue ID
 */
async function showVenueDetails(venueId) {
    console.log(`Loading details for venue ${venueId}...`);

    const modal = document.getElementById('venue-modal');
    const modalContent = document.querySelector('.venue-modal-content');

    if (!modal || !modalContent) {
        console.error('Venue modal not found');
        return;
    }

    // Show modal with loading state
    modal.style.display = 'flex';
    modalContent.innerHTML = `
        <span class="close-venue-modal" onclick="closeVenueModal()">&times;</span>
        <div style="text-align: center; padding: 40px;">
            <p style="font-size: 1.2rem;">Loading venue details...</p>
        </div>
    `;

    try {
        const response = await fetch(API_ENDPOINTS.venueDetail(venueId));
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const venue = await response.json();

        // Display venue details
        displayVenueDetails(venue);

    } catch (error) {
        console.error('Error loading venue details:', error);
        modalContent.innerHTML = `
            <span class="close-venue-modal" onclick="closeVenueModal()">&times;</span>
            <div style="text-align: center; padding: 40px;">
                <p style="font-size: 1.2rem; color: #e74c3c;">Error loading venue details</p>
                <button onclick="closeVenueModal()" style="margin-top: 20px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 20px; cursor: pointer;">Close</button>
            </div>
        `;
    }
}

/**
 * Display venue details in modal
 */
function displayVenueDetails(venue) {
    const modalContent = document.querySelector('.venue-modal-content');

    const categoryIcon = venue.category?.icon || '📍';
    const categoryName = venue.category?.name || 'Venue';
    const areaText = venue.area ? `${venue.area}, ` : '';
    const ratingText = venue.rating && venue.rating > 0 ? `⭐ ${venue.rating}/5.0` : 'No rating yet';
    const phoneText = venue.phone_number || 'Not available';
    const websiteText = venue.website ? 
        `<a href="${venue.website}" target="_blank" style="color: #667eea; text-decoration: none;">Visit Website</a>` : 
        'Not available';

    // Build amenities list
    let amenitiesHTML = '';
    if (venue.amenities_list && venue.amenities_list.length > 0) {
        amenitiesHTML = '<h3 style="margin-top: 20px; margin-bottom: 10px;">Amenities</h3><div style="display: flex; flex-wrap: wrap; gap: 8px;">';
        venue.amenities_list.forEach(amenity => {
            amenitiesHTML += `
                <span style="background: rgba(102, 126, 234, 0.2); padding: 6px 12px; border-radius: 15px; font-size: 0.9rem;">
                    ${amenity.icon} ${amenity.name}
                </span>
            `;
        });
        amenitiesHTML += '</div>';
    }

    // Google Maps directions link
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`;

    modalContent.innerHTML = `
        <span class="close-venue-modal" onclick="closeVenueModal()">&times;</span>
        
        <div style="margin-bottom: 20px;">
            <h2 style="margin: 0 0 10px 0; font-size: 1.8rem;">${venue.name}</h2>
            <p style="font-size: 1.1rem; color: #666; margin: 5px 0;">
                ${categoryIcon} ${categoryName}
            </p>
        </div>

        <div style="margin-bottom: 15px;">
            <p style="line-height: 1.6; color: #555;">
                ${venue.description || 'No description available.'}
            </p>
        </div>

        <div style="background: #f9f9f9; padding: 15px; border-radius: 12px; margin-bottom: 15px;">
            <p style="margin: 8px 0;"><strong>📍 Location:</strong> ${areaText}${venue.city}</p>
            <p style="margin: 8px 0;"><strong>🏠 Address:</strong> ${venue.address}</p>
            <p style="margin: 8px 0;"><strong>💰 Price Range:</strong> ${venue.price_range}</p>
            <p style="margin: 8px 0;"><strong>⭐ Rating:</strong> ${ratingText}</p>
            <p style="margin: 8px 0;"><strong>📞 Phone:</strong> ${phoneText}</p>
            <p style="margin: 8px 0;"><strong>🌐 Website:</strong> ${websiteText}</p>
        </div>

        ${amenitiesHTML}

        <div style="margin-top: 25px; display: flex; gap: 10px;">
            <a href="${directionsUrl}" target="_blank" 
               style="flex: 1; padding: 14px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; text-align: center; font-weight: 600; display: inline-block;">
                🗺️ Get Directions
            </a>
            <button onclick="closeVenueModal()" 
                    style="padding: 14px 20px; background: #e0e0e0; color: #333; border: none; border-radius: 25px; cursor: pointer; font-weight: 600;">
                Close
            </button>
        </div>
    `;
}

/**
 * Close venue modal
 */
function closeVenueModal() {
    const modal = document.getElementById('venue-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('venue-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeVenueModal();
            }
        });
    }
});