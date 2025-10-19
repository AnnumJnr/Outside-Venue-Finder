// Current user state
let currentUser = null;
let isLoggedIn = false;

/**
 * Initialize authentication
 */
function initializeAuth() {
    console.log('Initializing authentication...');
    
    // Check if user is logged in
    checkAuthStatus();
    
    // Login button click
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', openAuthModal);
    }
    
    // Close auth modal
    const closeAuthModal = document.getElementById('close-auth-modal');
    if (closeAuthModal) {
        closeAuthModal.addEventListener('click', () => {
            document.getElementById('auth-modal').classList.remove('active');
        });
    }
    
    // Toggle between login and signup
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    
    if (showSignup) {
        showSignup.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAuthForm('signup');
        });
    }
    
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAuthForm('login');
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
    
    // User profile click (logout)
    const userProfile = document.getElementById('user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', handleProfileClick);
    }
    
    // Load recent searches if logged in
    if (isLoggedIn) {
        loadRecentSearches();
    }
    
    console.log('✅ Authentication initialized');
}

/**
 * Check authentication status
 */
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/me/', {
            credentials: 'include'
        });
        
        if (response.ok) {
            currentUser = await response.json();
            isLoggedIn = true;
            updateUIForLoggedInUser();
            console.log('✅ User logged in:', currentUser.username);
        } else {
            isLoggedIn = false;
            updateUIForLoggedOutUser();
            console.log('ℹ️ User not logged in');
        }
    } catch (error) {
        console.log('ℹ️ Auth check failed (not logged in)');
        isLoggedIn = false;
        updateUIForLoggedOutUser();
    }
}

/**
 * Open authentication modal
 */
function openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.classList.add('active');
        toggleAuthForm('login'); // Show login by default
    }
}

/**
 * Toggle between login and signup forms
 */
function toggleAuthForm(formType) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authTitle = document.getElementById('auth-title');
    
    if (formType === 'login') {
        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';
        authTitle.textContent = 'Welcome Back!';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'flex';
        authTitle.textContent = 'Create Your Account';
    }
}

/**
 * Handle login form submission
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const username = form.querySelector('input[name="username"]').value;
    const password = form.querySelector('input[name="password"]').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Show loading state
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/auth/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            isLoggedIn = true;
            
            // Close modal
            document.getElementById('auth-modal').classList.remove('active');
            
            // Update UI
            updateUIForLoggedInUser();
            
            // Show success message
            showNotification('✅ Welcome back, ' + currentUser.username + '!', 'success');
            
            // Load recent searches
            loadRecentSearches();
            
            // Reset form
            form.reset();
        } else {
            const error = await response.json();
            showNotification('❌ ' + (error.message || 'Invalid username or password'), 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('❌ Login failed. Please try again.', 'error');
    } finally {
        submitBtn.textContent = 'Login';
        submitBtn.disabled = false;
    }
}

/**
 * Handle signup form submission
 */
async function handleSignup(e) {
    e.preventDefault();
    
    const form = e.target;
    const username = form.querySelector('input[name="username"]').value;
    const email = form.querySelector('input[name="email"]').value;
    const fullName = form.querySelector('input[name="full_name"]').value;
    const password = form.querySelector('input[name="password"]').value;
    const password2 = form.querySelector('input[name="password2"]').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Validate passwords match
    if (password !== password2) {
        showNotification('❌ Passwords do not match', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.textContent = 'Creating account...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/auth/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ 
                username, 
                email, 
                full_name: fullName,
                password,
                password2
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            isLoggedIn = true;
            
            // Close modal
            document.getElementById('auth-modal').classList.remove('active');
            
            // Update UI
            updateUIForLoggedInUser();
            
            // Show success message
            showNotification('🎉 Account created! Welcome, ' + currentUser.username + '!', 'success');
            
            // Reset form
            form.reset();
        } else {
            const error = await response.json();
            const errorMsg = Object.values(error)[0] || 'Registration failed';
            showNotification('❌ ' + errorMsg, 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('❌ Registration failed. Please try again.', 'error');
    } finally {
        submitBtn.textContent = 'Sign Up';
        submitBtn.disabled = false;
    }
}

/**
 * Handle profile click (logout)
 */
function handleProfileClick() {
    if (confirm('Do you want to log out?')) {
        logout();
    }
}

/**
 * Logout user
 */
async function logout() {
    try {
        const response = await fetch('/api/auth/logout/', {
            method: 'POST',
            credentials: 'include',
        });
        
        if (response.ok) {
            currentUser = null;
            isLoggedIn = false;
            updateUIForLoggedOutUser();
            showNotification('👋 Logged out successfully', 'success');
            
            // Hide recent searches
            const recentSearches = document.getElementById('recent-searches');
            if (recentSearches) {
                recentSearches.classList.remove('active');
            }
        }
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('❌ Logout failed', 'error');
    }
}

/**
 * Update UI for logged in user
 */
function updateUIForLoggedInUser() {
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const userName = document.getElementById('user-name');
    const userAvatar = document.getElementById('user-avatar');
    const welcomeMessage = document.getElementById('welcome-message');
    const welcomeName = document.getElementById('welcome-name');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (userProfile) userProfile.style.display = 'flex';
    
    if (currentUser) {
        if (userName) userName.textContent = currentUser.username;
        if (userAvatar) userAvatar.textContent = currentUser.username.charAt(0).toUpperCase();
        if (welcomeMessage) welcomeMessage.style.display = 'block';
        if (welcomeName) welcomeName.textContent = currentUser.username;
    }
}

/**
 * Update UI for logged out user
 */
function updateUIForLoggedOutUser() {
    const loginBtn = document.getElementById('login-btn');
    const userProfile = document.getElementById('user-profile');
    const welcomeMessage = document.getElementById('welcome-message');
    
    if (loginBtn) loginBtn.style.display = 'block';
    if (userProfile) userProfile.style.display = 'none';
    if (welcomeMessage) welcomeMessage.style.display = 'none';
}

/**
 * Load recent searches
 */
async function loadRecentSearches() {
    if (!isLoggedIn) return;
    
    try {
        const response = await fetch('/api/search-history/', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const searches = await response.json();
            displayRecentSearches(searches);
        }
    } catch (error) {
        console.log('Could not load search history');
    }
}

/**
 * Display recent searches
 */
function displayRecentSearches(searches) {
    const recentSearches = document.getElementById('recent-searches');
    const searchItems = document.getElementById('recent-search-items');
    
    if (!recentSearches || !searchItems || searches.length === 0) {
        return;
    }
    
    // Clear existing
    searchItems.innerHTML = '';
    
    // Show only last 5 searches
    searches.slice(0, 5).forEach(search => {
        const item = document.createElement('div');
        item.className = 'recent-search-item';
        
        const categoryIcon = CATEGORY_ICONS[search.category] || '📍';
        const location = search.area ? `${search.city}, ${search.area}` : search.city;
        
        item.innerHTML = `${categoryIcon} ${search.category} in ${location}`;
        item.dataset.category = search.category;
        item.dataset.city = search.city;
        item.dataset.area = search.area || '';
        
        // Click to repeat search
        item.addEventListener('click', function() {
            repeatSearch(this.dataset.category, this.dataset.city, this.dataset.area);
        });
        
        searchItems.appendChild(item);
    });
    
    // Show recent searches section
    recentSearches.classList.add('active');
}

/**
 * Repeat a previous search
 */
function repeatSearch(category, city, area) {
    selectedCategory = category;
    
    // Find category info
    const categoryCard = document.querySelector(`[data-category="${category}"]`);
    if (categoryCard) {
        selectedCategoryIcon = categoryCard.dataset.icon;
        selectedCategoryName = categoryCard.querySelector('.category-name').textContent;
    }
    
    // Set location
    const locationInput = document.getElementById('location-input');
    if (locationInput) {
        locationInput.value = area ? `${city}, ${area}` : city;
    }
    
    // Perform search
    performSearch();
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Style based on type
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
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeAuth);