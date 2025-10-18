const API_URL = 'http://localhost:5000/api';
let allStories = [];
let allUsers = [];
let currentFilter = 'all';

// Check authentication and admin role
function checkAuth() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token || user.role !== 'admin') {
    alert('Access denied. Admin only.');
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('userGreeting').textContent = `Hello, ${user.username}!`;
}

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});

// Load all stories (including pending)
async function loadStories() {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_URL}/admin/stories`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load stories');
    }

    allStories = await response.json();
    updateStats();
    displayStories(allStories);
    loadUsers(); // Load users after stories
  } catch (error) {
    console.error('Error loading stories:', error);
    document.getElementById('loadingContainer').classList.add('hidden');
    showAlert('Failed to load stories. Please make sure the server is running.', 'error');
  }
}

// Load all users
async function loadUsers() {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load users');
    }

    allUsers = await response.json();
    updateUserStats();
    displayUsers(allUsers);
  } catch (error) {
    console.error('Error loading users:', error);
    document.getElementById('usersLoadingContainer').classList.add('hidden');
    showAlert('Failed to load users.', 'error');
  }
}

// Update user stats
function updateUserStats() {
  document.getElementById('totalUsers').textContent = allUsers.length;
}

// Display users
function displayUsers(users) {
  const loadingEl = document.getElementById('usersLoadingContainer');
  const containerEl = document.getElementById('usersTableContainer');
  const gridEl = document.getElementById('usersGrid');
  const noUsersEl = document.getElementById('noUsersMessage');

  loadingEl.classList.add('hidden');

  if (users.length === 0) {
    containerEl.classList.add('hidden');
    noUsersEl.classList.remove('hidden');
    return;
  }

  gridEl.innerHTML = users.map(user => createUserCard(user)).join('');
  containerEl.classList.remove('hidden');
  noUsersEl.classList.add('hidden');
}

// Create user card HTML
function createUserCard(user) {
  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  
  // Get user's profile picture
  const profilePic = localStorage.getItem(`profilePic_${user.id}`);
  const avatarHTML = profilePic 
    ? `<img src="${profilePic}" alt="${user.username}">` 
    : user.username.charAt(0).toUpperCase();
  
  // Count user's stories
  const userStories = allStories.filter(story => story.authorId === user.id);
  const approvedStories = userStories.filter(story => story.status === 'approved').length;
  const pendingStories = userStories.filter(story => story.status === 'pending').length;
  
  const roleClass = user.role === 'admin' ? 'user-role-admin' : 'user-role-user';
  const roleText = user.role === 'admin' ? '👑 Admin' : '👤 User';
  
  // Check if this is the current admin user
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isCurrentUser = currentUser.id === user.id;
  
  return `
    <div class="user-card">
      <div class="user-card-header">
        <div class="user-card-avatar">
          ${avatarHTML}
        </div>
        <div class="user-card-info">
          <div class="user-card-name">
            ${escapeHtml(user.username)}
            ${isCurrentUser ? '<span style="color: var(--primary); font-size: 0.85rem; margin-left: 0.5rem;">(You)</span>' : ''}
          </div>
          <div class="user-card-email">${escapeHtml(user.email || 'No email')}</div>
        </div>
      </div>
      <div class="user-card-details">
        <div class="user-detail-item">
          <span class="user-detail-label">Role</span>
          <span class="user-role-badge ${roleClass}">${roleText}</span>
        </div>
        <div class="user-detail-item">
          <span class="user-detail-label">Joined</span>
          <span class="user-detail-value">${joinDate}</span>
        </div>
        <div class="user-detail-item">
          <span class="user-detail-label">Total Stories</span>
          <span class="user-detail-value">${userStories.length}</span>
        </div>
        <div class="user-detail-item">
          <span class="user-detail-label">Approved</span>
          <span class="user-detail-value" style="color: #10b981;">${approvedStories}</span>
        </div>
        <div class="user-detail-item">
          <span class="user-detail-label">Pending</span>
          <span class="user-detail-value" style="color: #f59e0b;">${pendingStories}</span>
        </div>
        <div class="user-detail-item">
          <span class="user-detail-label">User ID</span>
          <span class="user-detail-value" style="font-size: 0.85rem; font-family: monospace;">${user.id.substring(0, 8)}...</span>
        </div>
      </div>
      ${!isCurrentUser ? `
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid var(--border);">
          <button 
            class="btn btn-danger btn-small" 
            onclick="deleteUser('${user.id}', '${escapeHtml(user.username)}')"
            style="width: 100%;"
          >
            🗑️ Delete User & All Content
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

// Update statistics
function updateStats() {
  const total = allStories.length;
  const pending = allStories.filter(s => s.status === 'pending').length;
  const approved = allStories.filter(s => s.status === 'approved').length;
  const rejected = allStories.filter(s => s.status === 'rejected').length;

  document.getElementById('totalStories').textContent = total;
  document.getElementById('pendingStories').textContent = pending;
  document.getElementById('approvedStories').textContent = approved;
  document.getElementById('rejectedStories').textContent = rejected;
}

// Display stories in table
function displayStories(stories) {
  const loadingContainer = document.getElementById('loadingContainer');
  const tableContainer = document.getElementById('storiesTableContainer');
  const tableBody = document.getElementById('storiesTableBody');
  const noStoriesMessage = document.getElementById('noStoriesMessage');

  loadingContainer.classList.add('hidden');

  if (stories.length === 0) {
    tableContainer.classList.add('hidden');
    noStoriesMessage.classList.remove('hidden');
    return;
  }

  noStoriesMessage.classList.add('hidden');
  tableContainer.classList.remove('hidden');

  // Sort by date (newest first)
  stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  tableBody.innerHTML = stories.map(story => `
    <tr>
      <td>
        <strong>${escapeHtml(story.title)}</strong>
        <br>
        <small style="color: var(--text-light);">${escapeHtml(story.intro || story.content.substring(0, 80) + '...')}</small>
      </td>
      <td>${escapeHtml(story.author)}</td>
      <td>${new Date(story.createdAt).toLocaleDateString()}</td>
      <td>
        <span class="status-badge status-${story.status}">
          ${story.status.toUpperCase()}
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button class="btn btn-small btn-secondary" onclick="viewStoryModal('${story.id}')">
            👁️ View
          </button>
          ${story.status === 'pending' ? `
            <button class="btn btn-small btn-success" onclick="approveStory('${story.id}')">
              ✓ Approve
            </button>
            <button class="btn btn-small btn-danger" onclick="rejectStory('${story.id}')">
              ✗ Reject
            </button>
          ` : ''}
          <button class="btn btn-small btn-danger" onclick="deleteStory('${story.id}')">
            🗑️ Delete
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Filter stories
function filterStories(filter) {
  currentFilter = filter;
  
  let filtered = allStories;
  if (filter !== 'all') {
    filtered = allStories.filter(s => s.status === filter);
  }

  displayStories(filtered);

  // Update button styles
  document.querySelectorAll('.admin-table .btn-small').forEach(btn => {
    btn.classList.remove('btn-primary');
    btn.classList.add('btn-secondary');
  });
  event.target.classList.remove('btn-secondary');
  event.target.classList.add('btn-primary');
}

// View story in modal
function viewStoryModal(id) {
  const story = allStories.find(s => s.id === id);
  if (!story) return;

  const modal = document.getElementById('storyModal');
  const modalContent = document.getElementById('modalContent');

  modalContent.innerHTML = `
    <h2 style="color: var(--primary); margin-bottom: 1rem;">${escapeHtml(story.title)}</h2>
    <div style="color: var(--text-light); margin-bottom: 1rem;">
      <span>✍️ By ${escapeHtml(story.author)}</span> | 
      <span>📅 ${new Date(story.createdAt).toLocaleDateString()}</span> | 
      <span class="status-badge status-${story.status}">${story.status.toUpperCase()}</span>
    </div>
    
    <!-- Image Section -->
    <div style="margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <strong style="color: var(--primary);">📷 Story Image</strong>
        <button onclick="showImageUpload('${story.id}')" class="btn btn-small btn-primary">Change Image</button>
      </div>
      ${story.image ? `<img id="storyImage-${story.id}" src="${story.image}" alt="${escapeHtml(story.title)}" style="width: 100%; border-radius: 12px;">` : '<p style="color: var(--text-light);">No image uploaded</p>'}
      <div id="imageUploadForm-${story.id}" class="hidden" style="margin-top: 1rem; padding: 1rem; background: var(--accent); border-radius: 8px;">
        <input type="file" id="newImage-${story.id}" accept="image/*" class="form-control" style="margin-bottom: 0.5rem;">
        <div style="display: flex; gap: 0.5rem;">
          <button onclick="uploadNewImage('${story.id}')" class="btn btn-small btn-success">Upload</button>
          <button onclick="cancelImageUpload('${story.id}')" class="btn btn-small btn-secondary">Cancel</button>
        </div>
      </div>
    </div>

    <div style="white-space: pre-wrap; line-height: 1.8; margin-bottom: 1.5rem;">${escapeHtml(story.content)}</div>

    <!-- Video Section -->
    <div style="margin-bottom: 1rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <strong style="color: var(--primary);">🎥 Story Video</strong>
        <button onclick="showVideoUpload('${story.id}')" class="btn btn-small btn-primary">Change Video</button>
      </div>
      ${story.video ? `
        <video id="storyVideo-${story.id}" controls style="width: 100%; border-radius: 12px;">
          <source src="${story.video}" type="video/mp4">
        </video>
      ` : '<p style="color: var(--text-light);">No video uploaded</p>'}
      <div id="videoUploadForm-${story.id}" class="hidden" style="margin-top: 1rem; padding: 1rem; background: var(--accent); border-radius: 8px;">
        <input type="file" id="newVideo-${story.id}" accept="video/*" class="form-control" style="margin-bottom: 0.5rem;">
        <div style="display: flex; gap: 0.5rem;">
          <button onclick="uploadNewVideo('${story.id}')" class="btn btn-small btn-success">Upload</button>
          <button onclick="cancelVideoUpload('${story.id}')" class="btn btn-small btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
}

// Close modal
function closeModal() {
  document.getElementById('storyModal').classList.add('hidden');
}

// Approve story
async function approveStory(id) {
  if (!confirm('Are you sure you want to approve this story?')) return;

  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_URL}/stories/${id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'approved' })
    });

    const data = await response.json();

    if (response.ok) {
      showAlert('Story approved successfully!', 'success');
      loadStories();
    } else {
      showAlert(data.error || 'Failed to approve story', 'error');
    }
  } catch (error) {
    console.error('Error approving story:', error);
    showAlert('Connection error', 'error');
  }
}

// Reject story
async function rejectStory(id) {
  if (!confirm('Are you sure you want to reject this story?')) return;

  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_URL}/stories/${id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'rejected' })
    });

    const data = await response.json();

    if (response.ok) {
      showAlert('Story rejected', 'info');
      loadStories();
    } else {
      showAlert(data.error || 'Failed to reject story', 'error');
    }
  } catch (error) {
    console.error('Error rejecting story:', error);
    showAlert('Connection error', 'error');
  }
}

// Delete story
async function deleteStory(id) {
  if (!confirm('Are you sure you want to permanently delete this story? This action cannot be undone.')) return;

  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_URL}/stories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok) {
      showAlert('Story deleted successfully', 'success');
      loadStories();
    } else {
      showAlert(data.error || 'Failed to delete story', 'error');
    }
  } catch (error) {
    console.error('Error deleting story:', error);
    showAlert('Connection error', 'error');
  }
}

// Alert function
function showAlert(message, type) {
  const alertContainer = document.getElementById('alertContainer');
  const alertClass = type === 'success' ? 'alert-success' : type === 'info' ? 'alert-info' : 'alert-error';
  
  alertContainer.innerHTML = `
    <div class="alert ${alertClass}">
      ${type === 'success' ? '✓' : type === 'info' ? 'ℹ' : '⚠'} ${message}
    </div>
  `;

  setTimeout(() => {
    alertContainer.innerHTML = '';
  }, 5000);
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show image upload form
function showImageUpload(storyId) {
  document.getElementById(`imageUploadForm-${storyId}`).classList.remove('hidden');
}

// Cancel image upload
function cancelImageUpload(storyId) {
  document.getElementById(`imageUploadForm-${storyId}`).classList.add('hidden');
  document.getElementById(`newImage-${storyId}`).value = '';
}

// Upload new image
async function uploadNewImage(storyId) {
  const fileInput = document.getElementById(`newImage-${storyId}`);
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select an image file');
    return;
  }

  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`${API_URL}/stories/${storyId}/media`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      showAlert('Image updated successfully!', 'success');
      // Update the image in the modal
      const imgElement = document.getElementById(`storyImage-${storyId}`);
      if (imgElement) {
        imgElement.src = data.story.image + '?t=' + new Date().getTime(); // Cache bust
      }
      cancelImageUpload(storyId);
      loadStories(); // Reload stories list
    } else {
      alert(data.error || 'Failed to update image');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    alert('Failed to upload image. Please try again.');
  }
}

// Show video upload form
function showVideoUpload(storyId) {
  document.getElementById(`videoUploadForm-${storyId}`).classList.remove('hidden');
}

// Cancel video upload
function cancelVideoUpload(storyId) {
  document.getElementById(`videoUploadForm-${storyId}`).classList.add('hidden');
  document.getElementById(`newVideo-${storyId}`).value = '';
}

// Upload new video
async function uploadNewVideo(storyId) {
  const fileInput = document.getElementById(`newVideo-${storyId}`);
  const file = fileInput.files[0];

  if (!file) {
    alert('Please select a video file');
    return;
  }

  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('video', file);

  try {
    const response = await fetch(`${API_URL}/stories/${storyId}/media`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      showAlert('Video updated successfully!', 'success');
      // Update the video in the modal
      const videoElement = document.getElementById(`storyVideo-${storyId}`);
      if (videoElement) {
        videoElement.src = data.story.video + '?t=' + new Date().getTime(); // Cache bust
        videoElement.load();
      }
      cancelVideoUpload(storyId);
      loadStories(); // Reload stories list
    } else {
      alert(data.error || 'Failed to update video');
    }
  } catch (error) {
    console.error('Error uploading video:', error);
    alert('Failed to upload video. Please try again.');
  }
}

// Close modal on outside click
document.getElementById('storyModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'storyModal') {
    closeModal();
  }
});

// Delete user and all their content
async function deleteUser(userId, username) {
  const confirmMessage = `⚠️ WARNING: This will permanently delete:\n\n` +
    `• User account: ${username}\n` +
    `• All their stories\n` +
    `• All their comments\n` +
    `• All uploaded media files\n\n` +
    `This action CANNOT be undone!\n\n` +
    `Type "${username}" to confirm deletion:`;
  
  const confirmation = prompt(confirmMessage);
  
  if (confirmation !== username) {
    if (confirmation !== null) {
      showAlert('Deletion cancelled. Username did not match.', 'error');
    }
    return;
  }
  
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showAlert(`User "${data.deletedUser}" and ${data.deletedStories} stories deleted successfully!`, 'success');
      
      // Reload users and stories
      await loadStories();
      await loadUsers();
    } else {
      showAlert(data.error || 'Failed to delete user', 'error');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    showAlert('Failed to delete user. Please try again.', 'error');
  }
}

// Tab switching
document.querySelectorAll('.admin-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.getAttribute('data-tab');
    
    // Update buttons
    document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Update content
    document.querySelectorAll('.admin-tab-content').forEach(content => {
      content.classList.remove('active');
      content.classList.add('hidden');
    });
    
    const targetTab = document.getElementById(`${tabName}Tab`);
    if (targetTab) {
      targetTab.classList.add('active');
      targetTab.classList.remove('hidden');
    }
  });
});

// Logo upload functionality
document.getElementById('logoUpload')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    showAlert('Please select an image file', 'error');
    return;
  }
  
  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showAlert('Image size must be less than 2MB', 'error');
    return;
  }
  
  // Convert to base64
  const reader = new FileReader();
  reader.onload = (event) => {
    const logoData = event.target.result;
    
    // Save to localStorage
    localStorage.setItem('websiteLogo', logoData);
    
    // Update preview
    updateLogoPreview(logoData);
    
    // Update all navigation logos
    updateAllLogos(logoData);
    
    showAlert('Logo uploaded successfully!', 'success');
  };
  
  reader.readAsDataURL(file);
});

// Update logo preview
function updateLogoPreview(logoData) {
  const currentLogo = document.getElementById('currentLogo');
  if (logoData) {
    currentLogo.innerHTML = `<img src="${logoData}" alt="Website Logo">`;
  } else {
    currentLogo.innerHTML = '🌹';
  }
}

// Update all navigation logos
function updateAllLogos(logoData) {
  const websiteName = localStorage.getItem('websiteName') || 'Choti Golpo';
  const logos = document.querySelectorAll('.logo');
  logos.forEach(logo => {
    if (logoData) {
      logo.innerHTML = `<img src="${logoData}" alt="Logo" style="height: 35px; width: auto; vertical-align: middle; margin-right: 8px;"> ${websiteName}`;
    } else {
      logo.innerHTML = `🌹 ${websiteName}`;
    }
  });
}

// Remove logo
function removeLogo() {
  if (confirm('Are you sure you want to remove the custom logo and use the default?')) {
    localStorage.removeItem('websiteLogo');
    updateLogoPreview(null);
    updateAllLogos(null);
    showAlert('Logo removed. Using default.', 'success');
  }
}

// Save website name
function saveWebsiteName() {
  const nameInput = document.getElementById('websiteName');
  const websiteName = nameInput.value.trim();
  
  if (!websiteName) {
    showAlert('Please enter a website name', 'error');
    return;
  }
  
  // Save to localStorage
  localStorage.setItem('websiteName', websiteName);
  
  // Update all logos with new name
  const savedLogo = localStorage.getItem('websiteLogo');
  updateAllLogos(savedLogo);
  
  showAlert('Website name updated successfully!', 'success');
}

// Load logo and name on page load
function loadLogo() {
  const savedLogo = localStorage.getItem('websiteLogo');
  const savedName = localStorage.getItem('websiteName') || 'Choti Golpo';
  
  // Update name input field
  const nameInput = document.getElementById('websiteName');
  if (nameInput) {
    nameInput.value = savedName;
  }
  
  if (savedLogo) {
    updateLogoPreview(savedLogo);
  }
  
  updateAllLogos(savedLogo);
}

// ==================== CATEGORY MANAGEMENT ====================

// Category definitions with emojis
const CATEGORIES = [
  { name: 'First Love', emoji: '💕' },
  { name: 'Long Distance', emoji: '🌍' },
  { name: 'Heartbreak', emoji: '💔' },
  { name: 'Marriage', emoji: '💍' },
  { name: 'Secret Love', emoji: '🤫' },
  { name: 'Friendship to Love', emoji: '👫' },
  { name: 'Reunion', emoji: '🔄' },
  { name: 'Forbidden Love', emoji: '🚫' },
  { name: 'Second Chance', emoji: '🎯' },
  { name: 'Teenage Romance', emoji: '🎓' },
  { name: 'Office Romance', emoji: '💼' },
  { name: 'Online Love', emoji: '💻' },
  { name: 'Family Opposition', emoji: '👨‍👩‍👧' },
  { name: 'Love Triangle', emoji: '🔺' },
  { name: 'Eternal Love', emoji: '♾️' },
  { name: 'Unrequited Love', emoji: '😢' },
  { name: 'Soulmate', emoji: '✨' },
  { name: 'Destiny', emoji: '🌟' }
];

// Load categories with story counts
async function loadCategories() {
  try {
    const response = await fetch(`${API_URL}/categories/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to load categories');
    }
    
    const categoryStats = await response.json();
    
    // Create a map of category counts
    const countMap = {};
    categoryStats.forEach(stat => {
      countMap[stat.name] = stat.count;
    });
    
    // Merge with category definitions
    const categoriesWithStats = CATEGORIES.map(cat => ({
      ...cat,
      count: countMap[cat.name] || 0
    }));
    
    displayCategories(categoriesWithStats);
  } catch (error) {
    console.error('Error loading categories:', error);
    document.getElementById('categoryLoadingContainer').classList.add('hidden');
    showAlert('Failed to load categories', 'error');
  }
}

// Display categories
function displayCategories(categories) {
  const loadingEl = document.getElementById('categoryLoadingContainer');
  const containerEl = document.getElementById('categoryListContainer');
  const listEl = document.getElementById('categoryList');
  
  loadingEl.classList.add('hidden');
  containerEl.classList.remove('hidden');
  
  // Sort by count (most used first)
  categories.sort((a, b) => b.count - a.count);
  
  listEl.innerHTML = categories.map(cat => createCategoryItem(cat)).join('');
}

// Create category item HTML
function createCategoryItem(category) {
  return `
    <div class="category-item" id="category-${escapeHtml(category.name).replace(/\s+/g, '-')}">
      <div class="category-info">
        <div class="category-emoji">${category.emoji}</div>
        <div class="category-details">
          <div class="category-name">${escapeHtml(category.name)}</div>
          <div class="category-stats">
            ${category.count} ${category.count === 1 ? 'story' : 'stories'} using this category
          </div>
        </div>
      </div>
      <div class="category-actions">
        <button class="btn btn-small btn-primary" onclick="showEditCategory('${escapeHtml(category.name)}', '${category.emoji}')">
          ✏️ Rename
        </button>
        <button class="btn btn-small btn-danger" onclick="deleteCategory('${escapeHtml(category.name)}', ${category.count})">
          🗑️ Delete
        </button>
      </div>
      <div class="category-edit-form" id="edit-form-${escapeHtml(category.name).replace(/\s+/g, '-')}">
        <div class="category-edit-inputs">
          <input 
            type="text" 
            id="emoji-${escapeHtml(category.name).replace(/\s+/g, '-')}" 
            class="form-control emoji-input" 
            value="${category.emoji}"
            placeholder="😊"
            maxlength="2"
          >
          <input 
            type="text" 
            id="newname-${escapeHtml(category.name).replace(/\s+/g, '-')}" 
            class="form-control" 
            value="${escapeHtml(category.name)}"
            placeholder="New category name"
          >
        </div>
        <div class="category-edit-actions">
          <button class="btn btn-small btn-success" onclick="saveCategory('${escapeHtml(category.name)}')">
            💾 Save Changes
          </button>
          <button class="btn btn-small btn-secondary" onclick="cancelEditCategory('${escapeHtml(category.name)}')">
            ✖ Cancel
          </button>
        </div>
        <p style="margin-top: 1rem; color: var(--text-light); font-size: 0.9rem;">
          ⚠️ This will update all ${category.count} ${category.count === 1 ? 'story' : 'stories'} that use this category.
        </p>
      </div>
    </div>
  `;
}

// Show edit form for category
function showEditCategory(categoryName) {
  const formId = `edit-form-${categoryName.replace(/\s+/g, '-')}`;
  const form = document.getElementById(formId);
  
  // Hide all other edit forms
  document.querySelectorAll('.category-edit-form').forEach(f => {
    f.classList.remove('active');
  });
  
  // Show this form
  if (form) {
    form.classList.add('active');
  }
}

// Cancel edit category
function cancelEditCategory(categoryName) {
  const formId = `edit-form-${categoryName.replace(/\s+/g, '-')}`;
  const form = document.getElementById(formId);
  
  if (form) {
    form.classList.remove('active');
  }
}

// Save category changes
async function saveCategory(oldName) {
  const safeOldName = oldName.replace(/\s+/g, '-');
  const newNameInput = document.getElementById(`newname-${safeOldName}`);
  const emojiInput = document.getElementById(`emoji-${safeOldName}`);
  
  const newName = newNameInput.value.trim();
  const newEmoji = emojiInput.value.trim();
  
  if (!newName) {
    showAlert('Category name cannot be empty', 'error');
    return;
  }
  
  if (newName === oldName && newEmoji === CATEGORIES.find(c => c.name === oldName)?.emoji) {
    showAlert('No changes detected', 'error');
    return;
  }
  
  // Confirm the change
  const confirmMessage = `Are you sure you want to rename "${oldName}" to "${newName}"?\n\nThis will update all stories that use this category.`;
  if (!confirm(confirmMessage)) {
    return;
  }
  
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_URL}/admin/categories/rename`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        oldName: oldName,
        newName: newName,
        emoji: newEmoji
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      const filesMsg = data.filesUpdated === data.totalFiles 
        ? `All ${data.totalFiles} frontend files updated automatically!` 
        : `${data.filesUpdated} of ${data.totalFiles} frontend files updated.`;
      
      showAlert(`✅ Category renamed successfully!\n• ${data.updatedStories} ${data.updatedStories === 1 ? 'story' : 'stories'} updated\n• ${filesMsg}`, 'success');
      
      // Update the category in the CATEGORIES array
      const catIndex = CATEGORIES.findIndex(c => c.name === oldName);
      if (catIndex !== -1) {
        CATEGORIES[catIndex].name = newName;
        CATEGORIES[catIndex].emoji = newEmoji;
      }
      
      // Reload categories and stories
      await loadCategories();
      await loadStories();
      
      // Show success notification
      setTimeout(() => {
        alert(`🎉 Category Rename Complete!\n\n✅ Database: ${data.updatedStories} stories updated\n✅ Frontend: ${data.filesUpdated}/${data.totalFiles} files updated\n\n"${oldName}" → "${newName}"\n\nNo manual editing required!`);
      }, 1000);
    } else {
      showAlert(data.error || 'Failed to rename category', 'error');
    }
  } catch (error) {
    console.error('Error renaming category:', error);
    showAlert('Connection error. Please try again.', 'error');
  }
}

// Add new category
async function addNewCategory() {
  const nameInput = document.getElementById('newCategoryName');
  const emojiInput = document.getElementById('newCategoryEmoji');
  
  const name = nameInput.value.trim();
  const emoji = emojiInput.value.trim() || '📂';
  
  if (!name) {
    showAlert('Please enter a category name', 'error');
    return;
  }
  
  // Check if category already exists
  if (CATEGORIES.find(c => c.name.toLowerCase() === name.toLowerCase())) {
    showAlert('Category already exists', 'error');
    return;
  }
  
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_URL}/admin/categories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, emoji })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showAlert(`✅ Category "${name}" added successfully!`, 'success');
      
      // Add to CATEGORIES array
      CATEGORIES.push({ name, emoji });
      
      // Clear inputs
      nameInput.value = '';
      emojiInput.value = '';
      
      // Reload categories
      await loadCategories();
      
      // Show success notification
      setTimeout(() => {
        alert(`🎉 Category Added!\n\n✅ Category: ${name} ${emoji}\n✅ Frontend files updated: ${data.filesUpdated}/${data.totalFiles}\n\nYou can now use this category when submitting stories!`);
      }, 500);
    } else {
      showAlert(data.error || 'Failed to add category', 'error');
    }
  } catch (error) {
    console.error('Error adding category:', error);
    showAlert('Connection error. Please try again.', 'error');
  }
}

// Delete category
async function deleteCategory(categoryName, storyCount) {
  if (storyCount > 0) {
    const confirmMessage = `⚠️ WARNING: This category is used by ${storyCount} ${storyCount === 1 ? 'story' : 'stories'}!\n\nDeleting this category will:\n• Remove it from all ${storyCount} ${storyCount === 1 ? 'story' : 'stories'}\n• Remove it from the frontend\n• This action CANNOT be undone!\n\nType "${categoryName}" to confirm deletion:`;
    
    const confirmation = prompt(confirmMessage);
    
    if (confirmation !== categoryName) {
      if (confirmation !== null) {
        showAlert('Deletion cancelled. Category name did not match.', 'error');
      }
      return;
    }
  } else {
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"?\n\nThis will remove it from the frontend files.`)) {
      return;
    }
  }
  
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(`${API_URL}/admin/categories/${encodeURIComponent(categoryName)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showAlert(`✅ Category "${categoryName}" deleted successfully!`, 'success');
      
      // Remove from CATEGORIES array
      const catIndex = CATEGORIES.findIndex(c => c.name === categoryName);
      if (catIndex !== -1) {
        CATEGORIES.splice(catIndex, 1);
      }
      
      // Reload categories and stories
      await loadCategories();
      await loadStories();
      
      // Show success notification
      setTimeout(() => {
        alert(`🗑️ Category Deleted!\n\n✅ Category: ${categoryName}\n✅ Stories updated: ${data.updatedStories}\n✅ Frontend files updated: ${data.filesUpdated}/${data.totalFiles}`);
      }, 500);
    } else {
      showAlert(data.error || 'Failed to delete category', 'error');
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    showAlert('Connection error. Please try again.', 'error');
  }
}

// Tab switching - add category tab loading
const originalTabSwitching = document.querySelectorAll('.admin-tab-btn');
originalTabSwitching.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.getAttribute('data-tab');
    
    // Load categories when switching to categories tab
    if (tabName === 'categories') {
      loadCategories();
    }
  });
});

// Initialize
checkAuth();
loadStories();
loadLogo();
