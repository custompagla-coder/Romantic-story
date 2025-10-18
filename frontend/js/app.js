const API_URL = 'http://localhost:5000/api';
let allStories = [];
let currentFilter = 'all';
let displayedStories = [];
let currentPage = 1;
const STORIES_PER_PAGE = 10;

// Check authentication
function checkAuth() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (token && user.username) {
    // Hide login link and show profile dropdowns (both desktop and mobile)
    document.getElementById('loginLink').classList.add('hidden');
    document.getElementById('profileDropdown')?.classList.remove('hidden');
    document.getElementById('profileDropdownMobile')?.classList.remove('hidden');
    
    // Show submit link for authenticated users
    document.getElementById('submitLink').classList.remove('hidden');

    // Set profile info for desktop
    const initial = user.username.charAt(0).toUpperCase();
    
    // Load profile picture from localStorage
    const savedProfilePic = localStorage.getItem(`profilePic_${user.id}`);
    
    // Update desktop profile
    updateProfileAvatar('profileInitial', initial, savedProfilePic);
    updateProfileAvatar('profileInitialLarge', initial, savedProfilePic);
    document.getElementById('profileUsername').textContent = user.username;
    document.getElementById('profileEmail').textContent = user.email || 'user@example.com';

    // Update mobile profile
    updateProfileAvatar('profileInitialMobile', initial, savedProfilePic);
    updateProfileAvatar('profileInitialLargeMobile', initial, savedProfilePic);
    document.getElementById('profileUsernameMobile').textContent = user.username;
    document.getElementById('profileEmailMobile').textContent = user.email || 'user@example.com';

    if (user.role === 'admin') {
      document.getElementById('adminLink').classList.remove('hidden');
    }
  }
}

// Update profile avatar with image or initial
function updateProfileAvatar(elementId, initial, profilePic) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const parentDiv = element.parentElement;
  
  if (profilePic) {
    // Create or update image element
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
    // Show initial
    element.textContent = initial;
    element.style.display = 'flex';
    const img = parentDiv.querySelector('img');
    if (img) img.remove();
  }
}

// Profile dropdown toggle - Desktop
const profileTrigger = document.getElementById('profileTrigger');
const profileMenu = document.getElementById('profileMenu');

profileTrigger?.addEventListener('click', function(e) {
  e.stopPropagation();
  profileMenu.classList.toggle('active');
  // Close mobile menu if open
  document.getElementById('profileMenuMobile')?.classList.remove('active');
});

// Profile dropdown toggle - Mobile
const profileTriggerMobile = document.getElementById('profileTriggerMobile');
const profileMenuMobile = document.getElementById('profileMenuMobile');

profileTriggerMobile?.addEventListener('click', function(e) {
  e.stopPropagation();
  profileMenuMobile.classList.toggle('active');
  // Close desktop menu if open
  document.getElementById('profileMenu')?.classList.remove('active');
});

// Close profile menu when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.profile-dropdown')) {
    profileMenu?.classList.remove('active');
    profileMenuMobile?.classList.remove('active');
  }
});

// Logout from dropdown - Desktop
document.getElementById('logoutBtnDropdown')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.reload();
});

// Logout from dropdown - Mobile
document.getElementById('logoutBtnDropdownMobile')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.reload();
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.reload();
});

// Load stories
async function loadStories() {
  try {
    const response = await fetch(`${API_URL}/stories`);
    
    if (!response.ok) {
      throw new Error('Failed to load stories');
    }

    allStories = await response.json();
    showFilterButtons();
    filterStories('all');
  } catch (error) {
    console.error('Error loading stories:', error);
    document.getElementById('loadingContainer').classList.add('hidden');
    showAlert('Failed to load stories. Please make sure the server is running.', 'error');
  }
}

// Show filter buttons
function showFilterButtons() {
  document.getElementById('loadingContainer').classList.add('hidden');
  document.getElementById('filterButtons').classList.remove('hidden');
  // Category buttons are hidden by default, shown only when Categories button is clicked
}

// Filter stories based on selected filter
function filterStories(filter, page = 1) {
  currentFilter = filter;
  currentPage = page;
  const container = document.getElementById('storiesContainer');
  const noStoriesMessage = document.getElementById('noStoriesMessage');
  
  // Update URL
  updateURL(page);
  
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

  if (allStories.length === 0) {
    container.classList.add('hidden');
    noStoriesMessage.classList.remove('hidden');
    return;
  }

  let filteredStories = [];

  switch(filter) {
    case 'all':
      // All stories sorted by date (newest first)
      filteredStories = [...allStories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    
    case 'latest':
      // Latest stories (newest first)
      filteredStories = [...allStories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    
    case 'popular':
      // Most popular (most views)
      filteredStories = [...allStories].sort((a, b) => (b.views || 0) - (a.views || 0));
      break;
    
    case 'top-rated':
      // Top rated (most likes)
      filteredStories = [...allStories].sort((a, b) => (b.likes || 0) - (a.likes || 0));
      break;
    
    case 'trending':
      // Trending (most views today)
      filteredStories = [...allStories]
        .filter(s => (s.viewsToday || 0) > 0)
        .sort((a, b) => (b.viewsToday || 0) - (a.viewsToday || 0));
      break;
    
    case 'authors':
      // Show popular authors instead of stories
      displayPopularAuthors();
      return; // Exit early, don't display stories
  }

  displayedStories = filteredStories;
  
  if (filteredStories.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 3rem; grid-column: 1/-1;">No stories found for this filter.</p>';
    hidePagination();
  } else {
    displayStoriesWithPagination(page);
  }

  container.classList.remove('hidden');
  noStoriesMessage.classList.add('hidden');
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Display stories with pagination
function displayStoriesWithPagination(page = 1) {
  const container = document.getElementById('storiesContainer');
  const startIndex = (page - 1) * STORIES_PER_PAGE;
  const endIndex = startIndex + STORIES_PER_PAGE;
  const storiesToShow = displayedStories.slice(startIndex, endIndex);
  
  container.innerHTML = storiesToShow.map(story => createStoryCard(story, true)).join('');
  
  // Show pagination controls
  if (displayedStories.length > STORIES_PER_PAGE) {
    showPaginationControls(page);
  } else {
    hidePagination();
  }
}

// Show pagination controls
function showPaginationControls(currentPage) {
  const totalPages = Math.ceil(displayedStories.length / STORIES_PER_PAGE);
  
  let paginationContainer = document.getElementById('paginationContainer');
  if (!paginationContainer) {
    paginationContainer = document.createElement('div');
    paginationContainer.id = 'paginationContainer';
    paginationContainer.className = 'pagination-container';
    document.getElementById('storiesContainer').parentElement.appendChild(paginationContainer);
  }
  
  paginationContainer.innerHTML = createPaginationHTML(currentPage, totalPages);
  paginationContainer.style.display = 'block';
}

// Create pagination HTML
function createPaginationHTML(currentPage, totalPages) {
  let pages = [];
  
  // Always show first page
  pages.push(1);
  
  // Calculate range around current page
  let startPage = Math.max(2, currentPage - 2);
  let endPage = Math.min(totalPages - 1, currentPage + 2);
  
  // Add ellipsis after first page if needed
  if (startPage > 2) {
    pages.push('...');
  }
  
  // Add pages around current page
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  // Add ellipsis before last page if needed
  if (endPage < totalPages - 1) {
    pages.push('...');
  }
  
  // Always show last page if more than 1 page
  if (totalPages > 1) {
    pages.push(totalPages);
  }
  
  // Remove duplicates
  pages = [...new Set(pages)];
  
  const pageButtons = pages.map(page => {
    if (page === '...') {
      return `<span class="pagination-ellipsis">...</span>`;
    }
    const isActive = page === currentPage ? 'active' : '';
    return `<button class="pagination-btn ${isActive}" onclick="goToPage(${page})">${page}</button>`;
  }).join('');
  
  const prevDisabled = currentPage === 1 ? 'disabled' : '';
  const nextDisabled = currentPage === totalPages ? 'disabled' : '';
  
  return `
    <div class="pagination-wrapper">
      <div class="pagination-pages">
        ${pageButtons}
      </div>
      <div class="pagination-nav">
        <button class="pagination-nav-btn ${prevDisabled}" onclick="goToPage(${currentPage - 1})" ${prevDisabled ? 'disabled' : ''}>
          ← Previous
        </button>
        <button class="pagination-nav-btn ${nextDisabled}" onclick="goToPage(${currentPage + 1})" ${nextDisabled ? 'disabled' : ''}>
          Next →
        </button>
      </div>
    </div>
  `;
}

// Go to specific page
function goToPage(page) {
  if (page < 1) return;
  const totalPages = Math.ceil(displayedStories.length / STORIES_PER_PAGE);
  if (page > totalPages) return;
  
  filterStories(currentFilter, page);
}

// Update URL with page parameter
function updateURL(page) {
  const url = new URL(window.location);
  if (page > 1) {
    url.searchParams.set('page', page);
  } else {
    url.searchParams.delete('page');
  }
  window.history.pushState({}, '', url);
}

// Hide pagination
function hidePagination() {
  const paginationContainer = document.getElementById('paginationContainer');
  if (paginationContainer) {
    paginationContainer.style.display = 'none';
  }
}

// Display popular authors
function displayPopularAuthors() {
  const container = document.getElementById('storiesContainer');
  
  // Group stories by author and calculate total views
  const authorStats = {};
  
  allStories.forEach(story => {
    if (!authorStats[story.author]) {
      authorStats[story.author] = {
        name: story.author,
        authorId: story.authorId,
        totalViews: 0,
        totalLikes: 0,
        storyCount: 0,
        stories: []
      };
    }
    
    authorStats[story.author].totalViews += (story.views || 0);
    authorStats[story.author].totalLikes += (story.likes || 0);
    authorStats[story.author].storyCount += 1;
    authorStats[story.author].stories.push(story);
  });
  
  // Convert to array and sort by total views
  const authors = Object.values(authorStats)
    .sort((a, b) => b.totalViews - a.totalViews);
  
  if (authors.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 3rem; grid-column: 1/-1;">No authors found.</p>';
  } else {
    container.innerHTML = authors.map((author, index) => createAuthorCard(author, index + 1)).join('');
  }
  
  container.classList.remove('hidden');
}

// Create author card HTML
function createAuthorCard(author, rank) {
  // Get author's profile picture from localStorage
  const authorProfilePic = localStorage.getItem(`profilePic_${author.authorId}`);
  
  // Determine rank badge color
  let rankClass = 'rank-badge';
  if (rank === 1) rankClass += ' rank-gold';
  else if (rank === 2) rankClass += ' rank-silver';
  else if (rank === 3) rankClass += ' rank-bronze';
  
  // Create avatar HTML
  const avatarHTML = authorProfilePic 
    ? `<img src="${authorProfilePic}" alt="${escapeHtml(author.name)}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">` 
    : `<div class="author-avatar-placeholder">${escapeHtml(author.name.charAt(0).toUpperCase())}</div>`;
  
  return `
    <div class="author-card" onclick="viewAuthorStories('${escapeHtml(author.name)}')">
      <div class="${rankClass}">Rank #${rank}</div>
      <div class="author-avatar">
        ${avatarHTML}
      </div>
      <div class="author-info">
        <h3 class="author-name">${escapeHtml(author.name)}</h3>
        <div class="author-stats">
          <span>📖 ${author.storyCount} ${author.storyCount === 1 ? 'story' : 'stories'}</span>
          <span>👁️ ${author.totalViews} views</span>
          <span>❤️ ${author.totalLikes} likes</span>
        </div>
      </div>
      <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); viewAuthorStories('${escapeHtml(author.name)}')">
        View Stories →
      </button>
    </div>
  `;
}

// View all stories by an author
function viewAuthorStories(authorName) {
  const authorStories = allStories.filter(story => story.author === authorName);
  const container = document.getElementById('storiesContainer');
  
  // Update active button (none should be active for author view)
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  if (authorStories.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 3rem; grid-column: 1/-1;">No stories found for this author.</p>';
  } else {
    // Sort by latest first
    const sortedStories = authorStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    container.innerHTML = `
      <div style="grid-column: 1/-1; margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; background: var(--card-bg); border-radius: 15px; box-shadow: 0 4px 15px var(--shadow);">
          <div>
            <h2 style="color: var(--primary); margin-bottom: 0.5rem;">👤 ${escapeHtml(authorName)}</h2>
            <p style="color: var(--text-light);">${authorStories.length} ${authorStories.length === 1 ? 'story' : 'stories'} • Latest first</p>
          </div>
          <button onclick="filterStories('authors')" class="btn btn-secondary btn-small">← Back to Authors</button>
        </div>
      </div>
      ${sortedStories.map(story => createStoryCard(story, true)).join('')}
    `;
  }
  
  container.classList.remove('hidden');
}

// Create story card HTML
function createStoryCard(story, showViews = false) {
  // Handle both old single category and new multiple categories format
  const categories = story.categories || (story.category ? [story.category] : []);
  const categoryBadges = categories.length > 0 
    ? `<div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
        ${categories.map(cat => `<span onclick="event.stopPropagation(); filterByCategory('${escapeHtml(cat)}')" style="display: inline-block; background: var(--primary); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.background='var(--primary-dark)'; this.style.transform='scale(1.05)'" onmouseout="this.style.background='var(--primary)'; this.style.transform='scale(1)'">${escapeHtml(cat)}</span>`).join('')}
      </div>` 
    : '';

  return `
    <div class="story-card" onclick="viewStory('${story.id}')">
      ${story.image 
        ? `<img src="${story.image}" alt="${escapeHtml(story.title)}" class="story-image">` 
        : '<div class="story-image" style="display: flex; align-items: center; justify-content: center; font-size: 3rem;">💕</div>'
      }
      <div class="story-content">
        ${categoryBadges}
        <h3 class="story-title">${escapeHtml(story.title)}</h3>
        <div class="story-author">
          <span onclick="event.stopPropagation(); filterByAuthor('${escapeHtml(story.author)}')" style="cursor: pointer; transition: color 0.3s ease;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color=''">✍️ ${escapeHtml(story.author)}</span>
        </div>
        <p class="story-intro">${escapeHtml(story.intro || story.content.substring(0, 150) + '...')}</p>
        <div class="story-footer">
          <button class="btn btn-primary btn-small" onclick="event.stopPropagation(); viewStory('${story.id}')">
            Read More →
          </button>
          <div style="display: flex; gap: 1rem; align-items: center; color: var(--text-light); font-size: 0.9rem;">
            ${showViews ? `<span>👁️ ${story.views || 0}</span>` : ''}
            <span style="color: var(--primary);">❤️ ${story.likes || 0}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Display stories (for search results)
function displaySearchResults(stories, page = 1) {
  currentPage = page;
  const container = document.getElementById('storiesContainer');
  displayedStories = stories;
  
  if (stories.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 3rem; grid-column: 1/-1;">No stories found matching your search.</p>';
    hidePagination();
    return;
  }

  const startIndex = (page - 1) * STORIES_PER_PAGE;
  const endIndex = startIndex + STORIES_PER_PAGE;
  const storiesToShow = stories.slice(startIndex, endIndex);
  container.innerHTML = storiesToShow.map(story => createStoryCard(story, true)).join('');
  container.classList.remove('hidden');
  
  // Show or hide pagination
  if (stories.length > STORIES_PER_PAGE) {
    showPaginationControls(page);
  } else {
    hidePagination();
  }
}

// View story
function viewStory(id) {
  window.location.href = `story.html?id=${id}`;
}

// Search functionality
document.getElementById('searchInput')?.addEventListener('input', (e) => {
  const searchTerm = e.target.value.toLowerCase().trim();
  
  if (!searchTerm) {
    filterStories(currentFilter);
    return;
  }

  const filteredStories = allStories.filter(story => {
    const matchesText = story.title.toLowerCase().includes(searchTerm) ||
      story.author.toLowerCase().includes(searchTerm) ||
      story.content.toLowerCase().includes(searchTerm);
    
    // Also search in categories
    const categories = story.categories || (story.category ? [story.category] : []);
    const matchesCategory = categories.some(cat => cat.toLowerCase().includes(searchTerm));
    
    return matchesText || matchesCategory;
  });

  displaySearchResults(filteredStories);
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

// Toggle category buttons visibility
function toggleCategories() {
  const categoryButtons = document.getElementById('categoryButtons');
  const categoriesBtn = document.querySelector('[data-filter="categories"]');
  
  if (categoryButtons.style.display === 'none' || categoryButtons.style.display === '') {
    // Show categories
    categoryButtons.style.display = 'flex';
    categoryButtons.classList.remove('hidden');
    categoriesBtn.classList.add('active');
  } else {
    // Hide categories
    categoryButtons.style.display = 'none';
    categoriesBtn.classList.remove('active');
    
    // Remove active state from all category buttons
    document.querySelectorAll('#categoryButtons .filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
  }
}

// Filter stories by category
function filterByCategory(category, page = 1) {
  currentPage = page;
  const container = document.getElementById('storiesContainer');
  
  // Update active button - remove active from main filter buttons except Categories
  document.querySelectorAll('#filterButtons .filter-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') !== 'categories') {
      btn.classList.remove('active');
    }
  });
  
  // Keep Categories button active
  document.querySelector('[data-filter="categories"]').classList.add('active');
  
  // Update active button for category buttons
  document.querySelectorAll('#categoryButtons .filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-category="${category}"]`).classList.add('active');
  
  // Filter stories by category (handle both old single category and new multiple categories)
  const categoryStories = allStories.filter(story => {
    if (story.categories && Array.isArray(story.categories)) {
      return story.categories.includes(category);
    } else if (story.category) {
      return story.category === category;
    }
    return false;
  });
  
  if (categoryStories.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <h2 style="color: var(--primary); margin-bottom: 1rem;">No stories in "${category}" category yet</h2>
        <p style="color: var(--text-light);">Be the first to share a story in this category!</p>
        <a href="submit.html" class="btn btn-primary mt-2">Submit Your Story</a>
      </div>
    `;
    hideLoadMoreButton();
  } else {
    // Sort by latest first
    const sortedStories = categoryStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    displayedStories = sortedStories;
    
    const headerHTML = `
      <div style="grid-column: 1/-1; margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; background: var(--card-bg); border-radius: 15px; box-shadow: 0 4px 15px var(--shadow);">
          <div>
            <h2 style="color: var(--primary); margin-bottom: 0.5rem;">${category} Stories</h2>
            <p style="color: var(--text-light);">${categoryStories.length} ${categoryStories.length === 1 ? 'story' : 'stories'} • Latest first</p>
          </div>
          <button onclick="filterStories('all')" class="btn btn-secondary btn-small">← Back to All Stories</button>
        </div>
      </div>
    `;
    
    const startIndex = (page - 1) * STORIES_PER_PAGE;
    const endIndex = startIndex + STORIES_PER_PAGE;
    const storiesToShow = sortedStories.slice(startIndex, endIndex);
    container.innerHTML = headerHTML + storiesToShow.map(story => createStoryCard(story, true)).join('');
    
    // Show or hide pagination
    if (sortedStories.length > STORIES_PER_PAGE) {
      showPaginationControls(page);
    } else {
      hidePagination();
    }
  }
  
  container.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Filter stories by author
function filterByAuthor(author, page = 1) {
  currentPage = page;
  const container = document.getElementById('storiesContainer');
  
  // Update active button - remove active from all filter buttons
  document.querySelectorAll('#filterButtons .filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Hide category buttons
  document.getElementById('categoryButtons').style.display = 'none';
  document.getElementById('categoryButtons').classList.add('hidden');
  
  // Filter stories by author
  const authorStories = allStories.filter(story => story.author === author);
  
  if (authorStories.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <h2 style="color: var(--primary); margin-bottom: 1rem;">No stories by "${author}" yet</h2>
        <p style="color: var(--text-light);">This author hasn't published any stories.</p>
        <button onclick="filterStories('all')" class="btn btn-primary mt-2">← Back to All Stories</button>
      </div>
    `;
    hideLoadMoreButton();
  } else {
    // Sort by latest first
    const sortedStories = authorStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    displayedStories = sortedStories;
    
    const headerHTML = `
      <div style="grid-column: 1/-1; margin-bottom: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; background: var(--card-bg); border-radius: 15px; box-shadow: 0 4px 15px var(--shadow);">
          <div>
            <h2 style="color: var(--primary); margin-bottom: 0.5rem;">✍️ Stories by ${escapeHtml(author)}</h2>
            <p style="color: var(--text-light);">${authorStories.length} ${authorStories.length === 1 ? 'story' : 'stories'} • Latest first</p>
          </div>
          <button onclick="filterStories('all')" class="btn btn-secondary btn-small">← Back to All Stories</button>
        </div>
      </div>
    `;
    
    const startIndex = (page - 1) * STORIES_PER_PAGE;
    const endIndex = startIndex + STORIES_PER_PAGE;
    const storiesToShow = sortedStories.slice(startIndex, endIndex);
    container.innerHTML = headerHTML + storiesToShow.map(story => createStoryCard(story, true)).join('');
    
    // Show or hide pagination
    if (sortedStories.length > STORIES_PER_PAGE) {
      showPaginationControls(page);
    } else {
      hidePagination();
    }
  }
  
  container.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Check for category parameter in URL and auto-filter
function checkCategoryParam() {
  const urlParams = new URLSearchParams(window.location.search);
  const category = urlParams.get('category');
  
  if (category) {
    // Wait for stories to load, then filter by category
    const checkStoriesLoaded = setInterval(() => {
      if (allStories.length > 0) {
        clearInterval(checkStoriesLoaded);
        // Show categories dropdown
        const categoryButtons = document.getElementById('categoryButtons');
        categoryButtons.style.display = 'flex';
        categoryButtons.classList.remove('hidden');
        document.querySelector('[data-filter="categories"]')?.classList.add('active');
        
        // Filter by the category
        filterByCategory(category);
      }
    }, 100);
  }
}

// Check for page parameter in URL
function checkPageParam() {
  const urlParams = new URLSearchParams(window.location.search);
  const page = parseInt(urlParams.get('page')) || 1;
  if (page > 1) {
    currentPage = page;
  }
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

// Load and render category buttons with counts
async function loadCategoryButtons() {
  // Category definitions with emojis
  const categories = [
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
  
  try {
    const response = await fetch(`${API_URL}/categories/stats`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const categoryStats = await response.json();
    
    // Create a map of category counts
    const countMap = {};
    categoryStats.forEach(stat => {
      countMap[stat.name] = stat.count;
    });
    
    // Sort categories by count (most used first)
    const sortedCategories = categories.map(cat => ({
      ...cat,
      count: countMap[cat.name] || 0
    })).sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.name.localeCompare(b.name);
    });
    
    // Render category buttons
    const categoryButtons = document.getElementById('categoryButtons');
    if (categoryButtons) {
      categoryButtons.innerHTML = sortedCategories.map(cat => {
        const countText = cat.count > 0 ? ` (${cat.count})` : '';
        return `<button class="filter-btn" data-category="${cat.name}" onclick="filterByCategory('${cat.name}')">
          ${cat.emoji} ${cat.name}${countText}
        </button>`;
      }).join('');
    }
  } catch (error) {
    // Fallback: render categories without counts
    const categoryButtons = document.getElementById('categoryButtons');
    if (categoryButtons) {
      categoryButtons.innerHTML = categories.map(cat => {
        return `<button class="filter-btn" data-category="${cat.name}" onclick="filterByCategory('${cat.name}')">
          ${cat.emoji} ${cat.name}
        </button>`;
      }).join('');
    }
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadStories();
  checkPageParam();
  checkCategoryParam();
  loadWebsiteLogo();
  loadCategoryButtons();
});
