/**
 * Authentication System - Complete Rebuild
 * Handles login, signup, logout, and session management
 */

// Current user state
let currentUser = null;
let isLoggedIn = false;

/**
 * Get CSRF token from cookies
 */
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

/**
 * Initialize authentication system
 */
function initializeAuth() {
    console.log('🔐 Initializing authentication system...');
    
    // Check current auth status
    checkAuthStatus();
    
    // Setup event listeners
    setupAuthEventListeners();
    
    console.log('✅ Authentication system ready');
}

/**
 * Setup all authentication event listeners
 */
function setupAuthEventListeners() {
    // Login button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', openAuthModal);
    }
    
    // Close modal buttons
    const closeAuthModal = document.getElementById('close-auth-modal');
    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', closeAuthModalHandler);
    }
    
    // Click outside modal to close
    const authModal = document.getElementById('auth-modal');
    if (authModal) {
        authModal.addEventListener('click', function(e) {
            if (e.target === authModal) {
                closeAuthModalHandler();
            }
        });
    }
    
    // Toggle between login and signup
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    
    if (showSignup) {
        showSignup.addEventListener('click', function(e) {
            e.preventDefault();
            showSignupForm();
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            showLoginForm();
        });
    }
    
    // Form submissions
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // User profile click (logout menu)
    const userProfile = document.getElementById('user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', showLogoutConfirm);
    }
}

/**
 * Check if user is currently authenticated
 */
async function checkAuthStatus() {
    console.log('🔍 Checking authentication status...');
    
    try {
        const response = await fetch('/api/auth/me/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        console.log('Auth check response:', response.status);
        
        if (response.ok) {
            currentUser = await response.json();
            isLoggedIn = true;
            updateUIForLoggedIn();
            loadRecentSearches();
            console.log('✅ User authenticated:', currentUser.username);
        } else {
            isLoggedIn = false;
            currentUser = null;
            updateUIForLoggedOut();
            console.log('ℹ️ User not authenticated');
        }
    } catch (error) {
        console.log('ℹ️ Auth check failed:', error.message);
        isLoggedIn = false;
        currentUser = null;
        updateUIForLoggedOut();
    }
}

/**
 * Open authentication modal
 */
function openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('active');
        showLoginForm(); // Default to login
    }
}

/**
 * Close authentication modal
 */
function closeAuthModalHandler() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.remove('active');
        
        // Reset forms
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        if (loginForm) loginForm.reset();
        if (signupForm) signupForm.reset();
    }
}

/**
 * Show login form
 */
function showLoginForm() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authTitle = document.getElementById('auth-title');
    
    if (loginForm) loginForm.style.display = 'flex';
    if (signupForm) signupForm.style.display = 'none';
    if (authTitle) authTitle.textContent = 'Welcome Back!';
}

/**
 * Show signup form
 */
function showSignupForm() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authTitle = document.getElementById('auth-title');
    
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'flex';
    if (authTitle) authTitle.textContent = 'Create Your Account';
}

/**
 * Handle login form submission
 */
async function handleLogin(e) {
    e.preventDefault();
    console.log('🔐 Login attempt...');
    
    const form = e.target;
    const username = form.querySelector('input[name="username"]').value.trim();
    const password = form.querySelector('input[name="password"]').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (!username || !password) {
        showNotification('❌ Please enter username and password', 'error');
        return;
    }
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    
    try {
        const csrftoken = getCookie('csrftoken');
        console.log('CSRF Token:', csrftoken ? 'Found' : 'Not found');
        
        const response = await fetch('/api/auth/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken || '',
            },
            credentials: 'include',
            body: JSON.stringify({ 
                username: username, 
                password: password 
            })
        });
        
        console.log('Login response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Login successful:', data);
            
            currentUser = data.user;
            isLoggedIn = true;
            
            // Close modal
            closeAuthModalHandler();
            
            // Update UI
            updateUIForLoggedIn();
            
            // Show success notification
            showNotification(`✅ Welcome back, ${currentUser.username}!`, 'success');
            
            // Load search history
            setTimeout(loadRecentSearches, 500);
            
            // Reset form
            form.reset();
            
        } else {
            // Handle error response
            let errorMessage = 'Login failed. Please check your credentials.';
            
            try {
                const errorData = await response.json();
                console.log('Login error data:', errorData);
                
                if (errorData.detail) {
                    errorMessage = errorData.detail;
                } else if (errorData.non_field_errors) {
                    errorMessage = errorData.non_field_errors[0];
                } else if (errorData.username) {
                    errorMessage = errorData.username[0];
                } else if (errorData.password) {
                    errorMessage = errorData.password[0];
                }
            } catch (e) {
                console.error('Could not parse error response');
            }
            
            showNotification('❌ ' + errorMessage, 'error');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification('❌ Connection error. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
}

/**
 * Handle signup form submission
 */
async function handleSignup(e) {
    e.preventDefault();
    console.log('📝 Signup attempt...');
    
    const form = e.target;
    const username = form.querySelector('input[name="username"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const fullName = form.querySelector('input[name="full_name"]').value.trim();
    const password = form.querySelector('input[name="password"]').value;
    const password2 = form.querySelector('input[name="password2"]').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Validate
    if (!username || !email || !fullName || !password || !password2) {
        showNotification('❌ Please fill in all fields', 'error');
        return;
    }
    
    if (password !== password2) {
        showNotification('❌ Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('❌ Password must be at least 8 characters', 'error');
        return;
    }
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';
    
    try {
        const csrftoken = getCookie('csrftoken');
        console.log('CSRF Token:', csrftoken ? 'Found' : 'Not found');
        
        const response = await fetch('/api/auth/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken || '',
            },
            credentials: 'include',
            body: JSON.stringify({ 
                username: username,
                email: email,
                full_name: fullName,
                password: password,
                password2: password2
            })
        });
        
        console.log('Signup response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('Signup successful:', data);
            
            currentUser = data.user;
            isLoggedIn = true;
            
            // Close modal
            closeAuthModalHandler();
            
            // Update UI
            updateUIForLoggedIn();
            
            // Show success notification
            showNotification(`🎉 Welcome, ${currentUser.username}!`, 'success');
            
            // Reset form
            form.reset();
            
        } else {
            // Handle error response
            let errorMessage = 'Signup failed. Please try again.';
            
            try {
                const errorData = await response.json();
                console.log('Signup error data:', errorData);
                
                if (errorData.username) {
                    errorMessage = 'Username: ' + errorData.username[0];
                } else if (errorData.email) {
                    errorMessage = 'Email: ' + errorData.email[0];
                } else if (errorData.password) {
                    errorMessage = 'Password: ' + errorData.password[0];
                } else if (errorData.password2) {
                    errorMessage = errorData.password2[0];
                } else if (errorData.detail) {
                    errorMessage = errorData.detail;
                }
            } catch (e) {
                console.error('Could not parse error response');
            }
            
            showNotification('❌ ' + errorMessage, 'error');
        }
        
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('❌ Connection error. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
    }
}

/**
 * Show logout confirmation
 */
function showLogoutConfirm() {
    if (confirm('Do you want to log out?')) {
        handleLogout();
    }
}

/**
 * Handle logout
 */
async function handleLogout() {
    console.log('🚪 Logging out...');
    
    try {
        const csrftoken = getCookie('csrftoken');
        
        const response = await fetch('/api/auth/logout/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken || '',
            },
            credentials: 'include',
        });
        
        console.log('Logout response status:', response.status);
        
        if (response.ok || response.status === 401) {
            // Consider both 200 and 401 as successful logout
            currentUser = null;
            isLoggedIn = false;
            
            // Update UI
            updateUIForLoggedOut();
            
            // Show notification
            showNotification('👋 Logged out successfully', 'success');
            
            console.log('✅ Logout successful');
        } else {
            console.error('Logout failed with status:', response.status);
            showNotification('❌ Logout failed. Refreshing page...', 'error');
            
            // Force logout by refreshing
            setTimeout(() => window.location.reload(), 1500);
        }
        
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('❌ Logout error. Refreshing page...', 'error');
        
        // Force logout by refreshing
        setTimeout(() => window.location.reload(), 1500);
    }
}

/**
 * Update UI for logged in state
 */
function updateUIForLoggedIn() {
    console.log('🎨 Updating UI for logged in user');
    
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');
    const welcomeMessage = document.getElementById('welcome-message');
    const welcomeName = document.getElementById('welcome-name');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (userProfile) userProfile.style.display = 'flex';
    
    if (currentUser) {
        const displayName = currentUser.full_name || currentUser.username;
        const initial = currentUser.username.charAt(0).toUpperCase();
        
        if (userName) userName.textContent = displayName;
        if (userAvatar) userAvatar.textContent = initial;
        if (welcomeMessage) welcomeMessage.style.display = 'block';
        if (welcomeName) welcomeName.textContent = displayName;
    }
}

/**
 * Update UI for logged out state
 */
function updateUIForLoggedOut() {
    console.log('🎨 Updating UI for logged out user');
    
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const welcomeMessage = document.getElementById('welcome-message');
    const recentSearches = document.getElementById('recent-searches');
    
    if (loginBtn) loginBtn.style.display = 'block';
    if (userProfile) userProfile.style.display = 'none';
    if (welcomeMessage) welcomeMessage.style.display = 'none';
    if (recentSearches) recentSearches.classList.remove('active');
}

/**
 * Load user's recent searches
 */
async function loadRecentSearches() {
    if (!isLoggedIn) {
        console.log('ℹ️ Not logged in, skipping search history');
        return;
    }
    
    console.log('📜 Loading search history...');
    
    try {
        const response = await fetch('/api/search-history/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            }
        });
        
        console.log('Search history response:', response.status);
        
        if (response.ok) {
            const searches = await response.json();
            console.log('Search history loaded:', searches.length, 'items');
            
            if (searches.length > 0) {
                displayRecentSearches(searches);
            }
        } else {
            console.log('Could not load search history:', response.status);
        }
    } catch (error) {
        console.error('Search history error:', error);
    }
}

/**
 * Display recent searches
 */
function displayRecentSearches(searches) {
    console.log('🎨 Displaying', searches.length, 'recent searches');
    
    const recentSearches = document.getElementById('recent-searches');
    const searchItems = document.getElementById('recent-search-items');
    
    if (!recentSearches || !searchItems) {
        console.error('Recent searches elements not found');
        return;
    }
    
    if (searches.length === 0) {
        recentSearches.classList.remove('active');
        return;
    }
    
    // Clear existing
    searchItems.innerHTML = '';
    
    // Show last 5 searches
    const recentSearchesList = searches.slice(0, 5);
    
    recentSearchesList.forEach(search => {
        const item = document.createElement('div');
        item.className = 'recent-search-item';
        
        const categoryIcon = CATEGORY_ICONS[search.category] || '📍';
        const categoryName = search.category.charAt(0).toUpperCase() + search.category.slice(1);
        const location = search.area ? `${search.city}, ${search.area}` : search.city;
        
        item.textContent = `${categoryIcon} ${categoryName} in ${location}`;
        item.dataset.category = search.category;
        item.dataset.city = search.city;
        item.dataset.area = search.area || '';
        
        // Click to repeat search
        item.addEventListener('click', function() {
            repeatSearch(this.dataset.category, this.dataset.city, this.dataset.area);
        });
        
        searchItems.appendChild(item);
    });
    
    // Show section
    recentSearches.classList.add('active');
    console.log('✅ Recent searches displayed');
}

/**
 * Repeat a previous search
 */
function repeatSearch(category, city, area) {
    console.log('🔄 Repeating search:', category, city, area);
    
    // Set selected category
    selectedCategory = category;
    
    // Find category info
    const categoryCard = document.querySelector(`[data-category="${category}"]`);
    if (categoryCard) {
        selectedCategoryIcon = categoryCard.dataset.icon;
        selectedCategoryName = categoryCard.querySelector('.category-name').textContent;
    }
    
    // Set location in input
    const locationInput = document.getElementById('location-input');
    if (locationInput) {
        locationInput.value = area ? `${city}, ${area}` : city;
    }
    
    // Perform search
    if (typeof performSearch === 'function') {
        performSearch();
    } else {
        console.error('performSearch function not found');
    }
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    console.log('📢 Notification:', message);
    
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Colors based on type
    const colors = {
        success: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        error: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)',
        info: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add notification animations
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
    initializeAuth();
}

console.log('📦 Auth module loaded');
