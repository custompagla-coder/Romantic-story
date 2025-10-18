const API_URL = 'http://localhost:5000/api';

// Category definitions with emojis
const CATEGORIES = [
  { name: 'মা ছেলে সেক্স', emoji: '💕' },
  { name: 'Long Distance', emoji: '🌍' },
  { name: 'Heartbreak', emoji: '💔' },
  { name: 'Marriage', emoji: '💍' },
  { name: 'Secret Love', emoji: '🤫' },
  { name: 'পরকিয়া বাংলা চটি গল্প', emoji: '👫' },
  { name: 'Reunion', emoji: '🔄' },
  { name: 'Second Chance', emoji: '🎯' },
  { name: 'Teenage Romance', emoji: '🎓' },
  { name: 'Office Romance', emoji: '💼' },
  { name: 'Online Love', emoji: '💻' },
  { name: 'Family Opposition', emoji: '👨‍👩‍👧' },
  { name: 'Eternal Love', emoji: '♾️' },
  { name: 'Unrequited Love', emoji: '😢' },
  { name: 'Soulmate', emoji: '✨' },
  { name: 'Destiny', emoji: '🌟' }
];

// Load category statistics
async function loadCategoryStats() {
  try {
    const response = await fetch(`${API_URL}/categories/stats`);
    const categoryStats = await response.json();
    
    // Create a map of category counts
    const countMap = {};
    categoryStats.forEach(stat => {
      countMap[stat.name] = stat.count;
    });
    
    // Sort categories by count (most used first), then alphabetically
    const sortedCategories = CATEGORIES.map(cat => ({
      ...cat,
      count: countMap[cat.name] || 0
    })).sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count; // Sort by count descending
      }
      return a.name.localeCompare(b.name); // Then alphabetically
    });
    
    // Update the dropdown
    const dropdownList = document.getElementById('categoryDropdownList');
    dropdownList.innerHTML = sortedCategories.map(cat => {
      const countText = cat.count > 0 ? ` (${cat.count})` : '';
      return `<div class="category-option" data-value="${cat.name}">${cat.emoji} ${cat.name}${countText}</div>`;
    }).join('');
    
    // Re-attach event listeners
    attachCategoryListeners();
  } catch (error) {
    console.error('Error loading category stats:', error);
    // Fallback to default categories without counts
    const dropdownList = document.getElementById('categoryDropdownList');
    dropdownList.innerHTML = CATEGORIES.map(cat => 
      `<div class="category-option" data-value="${cat.name}">${cat.emoji} ${cat.name}</div>`
    ).join('');
    attachCategoryListeners();
  }
}

// Attach event listeners to category options
function attachCategoryListeners() {
  document.querySelectorAll('.category-option').forEach(option => {
    option.addEventListener('click', function(e) {
      e.stopPropagation();
      this.classList.toggle('selected');
      
      const selectedCategories = document.querySelectorAll('.category-option.selected');
      const categoryPlaceholder = document.getElementById('categoryPlaceholder');
      
      if (selectedCategories.length > 0) {
        const categoryNames = Array.from(selectedCategories).map(cat => cat.getAttribute('data-value'));
        categoryPlaceholder.textContent = categoryNames.join(', ');
      } else {
        categoryPlaceholder.textContent = 'Select categories...';
      }
      
      document.getElementById('categoryError').style.display = 'none';
    });
  });
}

// Check authentication
function checkAuth() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  // Set profile info
  const initial = user.username.charAt(0).toUpperCase();
  const savedProfilePic = localStorage.getItem(`profilePic_${user.id}`);
  
  updateProfileAvatar('profileInitial', initial, savedProfilePic);
  updateProfileAvatar('profileInitialLarge', initial, savedProfilePic);
  document.getElementById('profileUsername').textContent = user.username;
  document.getElementById('profileEmail').textContent = user.email || 'user@example.com';

  if (user.role === 'admin') {
    document.getElementById('adminLink').classList.remove('hidden');
  }
}

// Update profile avatar with image or initial
function updateProfileAvatar(elementId, initial, profilePic) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const parentDiv = element.parentElement;
  
  if (profilePic) {
    let img = parentDiv.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '50%';
      parentDiv.appendChild(img);
    }
    img.src = profilePic;
    element.style.display = 'none';
  } else {
    element.textContent = initial;
    element.style.display = 'flex';
    const img = parentDiv.querySelector('img');
    if (img) img.remove();
  }
}

// Profile dropdown toggle
const profileTrigger = document.getElementById('profileTrigger');
const profileMenu = document.getElementById('profileMenu');

profileTrigger?.addEventListener('click', function(e) {
  e.stopPropagation();
  profileMenu.classList.toggle('active');
});

// Close profile menu when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.profile-dropdown')) {
    profileMenu?.classList.remove('active');
  }
});

// Logout from dropdown
document.getElementById('logoutBtnDropdown')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
});

// Image preview
document.getElementById('image')?.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById('imagePreview');
      preview.src = e.target.result;
      preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  }
});


// Category dropdown toggle
const dropdownHeader = document.getElementById('categoryDropdownHeader');
const dropdownList = document.getElementById('categoryDropdownList');
const categoryPlaceholder = document.getElementById('categoryPlaceholder');

dropdownHeader?.addEventListener('click', function() {
  const isOpen = dropdownList.style.display === 'block';
  
  if (isOpen) {
    dropdownList.style.display = 'none';
    dropdownHeader.classList.remove('active');
  } else {
    dropdownList.style.display = 'block';
    dropdownHeader.classList.add('active');
  }
});

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.custom-category-dropdown')) {
    dropdownList.style.display = 'none';
    dropdownHeader?.classList.remove('active');
  }
});

// Load categories with stats on page load
loadCategoryStats();

// Word count for intro field
document.getElementById('intro')?.addEventListener('input', (e) => {
  const text = e.target.value.trim();
  const words = text ? text.split(/\s+/).filter(word => word.length > 0) : [];
  const wordCount = words.length;
  const maxWords = 20;
  
  const countDisplay = document.getElementById('introWordCount');
  const warning = document.getElementById('introWarning');
  
  countDisplay.textContent = `${wordCount} / ${maxWords} words`;
  
  if (wordCount > maxWords) {
    countDisplay.style.color = '#ef4444';
    warning.style.display = 'block';
  } else {
    countDisplay.style.color = 'var(--text-light)';
    warning.style.display = 'none';
  }
});

// Submit form
document.getElementById('submitForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const intro = document.getElementById('intro').value.trim();
  const content = document.getElementById('content').value.trim();
  const imageFile = document.getElementById('image').files[0];

  // Get selected categories from clickable list
  const selectedCategories = document.querySelectorAll('.category-option.selected');
  const categories = Array.from(selectedCategories).map(option => option.getAttribute('data-value'));

  if (!title || !content) {
    showAlert('Please fill in the required fields', 'error');
    return;
  }

  if (categories.length === 0) {
    showAlert('Please select at least one category', 'error');
    document.getElementById('categoryError').style.display = 'block';
    return;
  } else {
    document.getElementById('categoryError').style.display = 'none';
  }

  // Validate intro word count
  if (intro) {
    const words = intro.split(/\s+/).filter(word => word.length > 0);
    if (words.length > 20) {
      showAlert('Short introduction must be 20 words or less', 'error');
      return;
    }
  }

  const token = localStorage.getItem('token');
  if (!token) {
    showAlert('Please login to submit a story', 'error');
    window.location.href = 'login.html';
    return;
  }

  // Create FormData
  const formData = new FormData();
  formData.append('title', title);
  formData.append('intro', intro);
  formData.append('categories', JSON.stringify(categories));
  formData.append('content', content);
  
  if (imageFile) {
    formData.append('image', imageFile);
  }

  // Disable submit button
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    const response = await fetch(`${API_URL}/stories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      showAlert('Story submitted successfully! It will be reviewed by our admin team.', 'success');
      
      // Reset form
      document.getElementById('submitForm').reset();
      document.getElementById('imagePreview').classList.add('hidden');

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    } else {
      showAlert(data.error || 'Failed to submit story', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Story for Review';
    }
  } catch (error) {
    console.error('Submit error:', error);
    showAlert('Connection error. Please make sure the server is running.', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Story for Review';
  }
});

// Alert function
function showAlert(message, type) {
  const alertContainer = document.getElementById('alertContainer');
  const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
  
  alertContainer.innerHTML = `
    <div class="alert ${alertClass}">
      ${type === 'success' ? '✓' : '⚠'} ${message}
    </div>
  `;

  // Scroll to top to see alert
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

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

// Initialize
checkAuth();
loadWebsiteLogo();
