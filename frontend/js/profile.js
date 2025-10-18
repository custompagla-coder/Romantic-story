const API_URL = 'http://localhost:5000/api';
let currentUser = null;
let userStories = [];

// Load website logo
function loadWebsiteLogo() {
  const savedLogo = localStorage.getItem('websiteLogo');
  const websiteName = localStorage.getItem('websiteName') || 'Choti Golpo';
  const logos = document.querySelectorAll('.logo');
  
  logos.forEach(logo => {
    if (savedLogo) {
      logo.innerHTML = `<img src="${savedLogo}" alt="Logo" style="height: 35px; width: auto; vertical-align: middle; margin-right: 8px;"> ${websiteName}`;
    } else {
      logo.innerHTML = `🌹 ${websiteName}`;
    }
  });
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token || !user.username) {
    window.location.href = 'login.html';
    return;
  }
  
  currentUser = user;
  
  // Load profile data
  loadProfile();
  loadUserStories();
  setupEventListeners();
  loadWebsiteLogo();
});

// Load profile information
function loadProfile() {
  if (!currentUser) return;
  
  // Update profile header
  document.getElementById('profileUsername').textContent = currentUser.username;
  document.getElementById('profileEmail').textContent = currentUser.email || 'No email';
  document.getElementById('userInitial').textContent = currentUser.username.charAt(0).toUpperCase();
  
  // Load profile picture from localStorage
  const savedProfilePic = localStorage.getItem(`profilePic_${currentUser.id}`);
  if (savedProfilePic) {
    displayProfilePicture(savedProfilePic);
  }
  
  // Update navigation
  const userGreeting = document.getElementById('userGreeting');
  const adminLink = document.getElementById('adminLink');
  
  if (userGreeting) {
    userGreeting.textContent = `Hello, ${currentUser.username}!`;
  }
  
  if (currentUser.role === 'admin' && adminLink) {
    adminLink.classList.remove('hidden');
  }
}

// Profile picture upload functionality
function setupProfilePictureUpload() {
  const profilePictureContainer = document.getElementById('profilePictureOverlay');
  const uploadBtn = document.getElementById('uploadPhotoBtn');
  const removeBtn = document.getElementById('removePhotoBtn');
  const fileInput = document.getElementById('profileImageInput');
  
  // Click on profile picture or overlay to upload
  profilePictureContainer?.addEventListener('click', () => {
    fileInput.click();
  });
  
  // Click upload button
  uploadBtn?.addEventListener('click', () => {
    fileInput.click();
  });
  
  // Handle file selection
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showAlert('Please select an image file', 'error');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showAlert('Image size should be less than 5MB', 'error');
        return;
      }
      
      // Read and display the image
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        displayProfilePicture(imageData);
        
        // Save to localStorage
        localStorage.setItem(`profilePic_${currentUser.id}`, imageData);
        
        showAlert('Profile picture updated successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  });
  
  // Remove profile picture
  removeBtn?.addEventListener('click', () => {
    if (confirm('Are you sure you want to remove your profile picture?')) {
      removeProfilePicture();
      localStorage.removeItem(`profilePic_${currentUser.id}`);
      showAlert('Profile picture removed', 'success');
    }
  });
}

// Display profile picture
function displayProfilePicture(imageData) {
  const profileImage = document.getElementById('profileImage');
  const userInitial = document.getElementById('userInitial');
  const removeBtn = document.getElementById('removePhotoBtn');
  
  profileImage.src = imageData;
  profileImage.style.display = 'block';
  userInitial.style.display = 'none';
  removeBtn?.classList.remove('hidden');
}

// Remove profile picture
function removeProfilePicture() {
  const profileImage = document.getElementById('profileImage');
  const userInitial = document.getElementById('userInitial');
  const removeBtn = document.getElementById('removePhotoBtn');
  
  profileImage.src = '';
  profileImage.style.display = 'none';
  userInitial.style.display = 'block';
  removeBtn?.classList.add('hidden');
}

// Load user's stories
async function loadUserStories() {
  const loadingEl = document.getElementById('storiesLoading');
  const containerEl = document.getElementById('storiesContainer');
  const noStoriesEl = document.getElementById('noStories');
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/stories`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load stories');
    }
    
    const allStories = await response.json();
    
    // Filter user's stories
    userStories = allStories.filter(story => 
      story.author === currentUser.username || story.authorId === currentUser.id
    );
    
    // Hide loading
    loadingEl.classList.add('hidden');
    
    // Show stories or empty state
    if (userStories.length === 0) {
      noStoriesEl.classList.remove('hidden');
    } else {
      displayStories();
      containerEl.classList.remove('hidden');
    }
    
  } catch (error) {
    console.error('Error loading stories:', error);
    loadingEl.classList.add('hidden');
    showAlert('Failed to load stories', 'error');
  }
}

// Display stories
function displayStories() {
  const container = document.getElementById('storiesContainer');
  
  container.innerHTML = userStories.map(story => `
    <div class="story-card" onclick="viewStory('${story.id}')">
      ${story.image 
        ? `<img src="${story.image}" alt="${escapeHtml(story.title)}" class="story-image">` 
        : '<div class="story-image story-placeholder">💕</div>'
      }
      <div class="story-content">
        <h3 class="story-title">${escapeHtml(story.title)}</h3>
        <p class="story-intro">${escapeHtml(story.intro || story.content.substring(0, 100))}...</p>
        <div class="story-stats">
          <span>👁️ ${story.views || 0}</span>
          <span>❤️ ${story.likes || 0}</span>
          <span class="story-status ${story.status}">${getStatusText(story.status)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Get status text
function getStatusText(status) {
  switch(status) {
    case 'approved': return '✓ Approved';
    case 'pending': return '⏳ Pending';
    case 'rejected': return '✗ Rejected';
    default: return status;
  }
}

// View story
function viewStory(id) {
  window.location.href = `story.html?id=${id}`;
}

// Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Setup event listeners
function setupEventListeners() {
  // Profile picture upload
  setupProfilePictureUpload();
  
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
  
  // Change password form
  document.getElementById('changePasswordForm').addEventListener('submit', handleChangePassword);
  
  // Logout
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
  });
}

// Switch tabs
function switchTab(tabName) {
  
  // Update buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    }
  });
  
  // Update content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.add('hidden');
    content.classList.remove('active');
  });
  
  const targetTab = document.getElementById(`${tabName}Tab`);
  if (targetTab) {
    targetTab.classList.remove('hidden');
    targetTab.classList.add('active');
  }
}

// Handle change password
async function handleChangePassword(e) {
  e.preventDefault();
  
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // Validate
  if (!currentPassword || !newPassword || !confirmPassword) {
    showAlert('All fields are required', 'error');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showAlert('New passwords do not match', 'error');
    return;
  }
  
  if (newPassword.length < 6) {
    showAlert('Password must be at least 6 characters', 'error');
    return;
  }
  
  if (currentPassword === newPassword) {
    showAlert('New password must be different from current password', 'error');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showAlert('✓ Password changed successfully!', 'success');
      document.getElementById('changePasswordForm').reset();
    } else {
      showAlert(data.error || 'Failed to change password', 'error');
    }
  } catch (error) {
    console.error('Error changing password:', error);
    showAlert('An error occurred: ' + error.message, 'error');
  }
}

// Show alert
function showAlert(message, type = 'info') {
  const container = document.getElementById('alertContainer');
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  
  container.appendChild(alert);
  
  setTimeout(() => {
    alert.remove();
  }, 5000);
}
