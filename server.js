const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'romantic-golpo-secret-key-2025';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));
app.use('/uploads', express.static('data/uploads'));

// Ensure directories exist
const ensureDirectories = () => {
  const dirs = [
    'data',
    'data/uploads',
    'data/uploads/images',
    'data/uploads/videos'
  ];
  dirs.forEach(dir => {
    if (!fsSync.existsSync(dir)) {
      fsSync.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureDirectories();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.mimetype.startsWith('image/') 
      ? 'data/uploads/images' 
      : 'data/uploads/videos';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Helper functions to read/write JSON files
const readJSON = async (filename) => {
  try {
    const data = await fs.readFile(filename, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeJSON = async (filename, data) => {
  await fs.writeFile(filename, JSON.stringify(data, null, 2));
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// Admin middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }
  next();
};

// ==================== AUTH ROUTES ====================

// Signup
app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const users = await readJSON('data/users.json');
    
    // Check if user already exists
    if (users.find(u => u.username === username || u.email === email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: 'user-' + Date.now(),
      username,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeJSON('data/users.json', users);

    // Create token
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const users = await readJSON('data/users.json');
    const user = users.find(u => u.username === username);

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // For the default admin, use a simple check (password: "admin123")
    let validPassword;
    if (user.username === 'admin' && password === 'admin123') {
      validPassword = true;
    } else {
      validPassword = await bcrypt.compare(password, user.password);
    }

    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Change password
app.put('/api/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    const users = await readJSON('data/users.json');
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, users[userIndex].password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    users[userIndex].password = hashedPassword;
    await writeJSON('data/users.json', users);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// ==================== STORY ROUTES ====================

// Get category statistics (public)
app.get('/api/categories/stats', async (req, res) => {
  try {
    const stories = await readJSON('data/stories.json');
    const approvedStories = stories.filter(s => s.status === 'approved');
    
    // Count stories per category
    const categoryCount = {};
    approvedStories.forEach(story => {
      const categories = story.categories || (story.category ? [story.category] : []);
      categories.forEach(cat => {
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
    });
    
    // Convert to array and sort by count (descending)
    const sortedCategories = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    res.json(sortedCategories);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get all approved stories (public)
app.get('/api/stories', async (req, res) => {
  try {
    const stories = await readJSON('data/stories.json');
    const approvedStories = stories.filter(s => s.status === 'approved');
    res.json(approvedStories);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get single story by ID
app.get('/api/stories/:id', async (req, res) => {
  try {
    const stories = await readJSON('data/stories.json');
    const story = stories.find(s => s.id === req.params.id);
    
    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    res.json(story);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Submit a new story (authenticated users)
app.post('/api/stories', authenticateToken, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, content, intro, categories } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Parse categories from JSON string
    let categoryArray = [];
    try {
      categoryArray = categories ? JSON.parse(categories) : [];
    } catch (e) {
      return res.status(400).json({ error: 'Invalid categories format' });
    }

    if (!categoryArray || categoryArray.length === 0) {
      return res.status(400).json({ error: 'At least one category is required' });
    }

    const stories = await readJSON('data/stories.json');

    const newStory = {
      id: 'story-' + Date.now(),
      title,
      content,
      intro: intro || content.substring(0, 150) + '...',
      categories: categoryArray,
      author: req.user.username,
      authorId: req.user.id,
      image: req.files?.image ? '/uploads/images/' + req.files.image[0].filename : null,
      video: req.files?.video ? '/uploads/videos/' + req.files.video[0].filename : null,
      status: 'pending',
      likes: 0,
      likedBy: [],
      views: 0,
      viewsToday: 0,
      lastViewDate: new Date().toISOString().split('T')[0],
      comments: [],
      createdAt: new Date().toISOString()
    };

    stories.push(newStory);
    await writeJSON('data/stories.json', stories);

    res.json({
      message: 'Story submitted successfully. Waiting for admin approval.',
      story: newStory
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// User stories endpoint removed - profile page deleted

// Get all stories (admin only - includes pending)
app.get('/api/admin/stories', authenticateToken, isAdmin, async (req, res) => {
  try {
    const stories = await readJSON('data/stories.json');
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
  try {
    const users = await readJSON('data/users.json');
    // Remove password hashes before sending
    const sanitizedUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json(sanitizedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Delete user and all their content (admin only)
app.delete('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent admin from deleting themselves
    if (req.user.id === userId) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }
    
    // Load users
    const users = await readJSON('data/users.json');
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const deletedUser = users[userIndex];
    
    // Load stories
    const stories = await readJSON('data/stories.json');
    
    // Find all stories by this user
    const userStories = stories.filter(s => s.authorId === userId);
    
    // Delete all media files associated with user's stories
    for (const story of userStories) {
      if (story.image) {
        const imagePath = path.join('data', story.image);
        try {
          await fs.unlink(imagePath);
        } catch (err) {
          console.log('Image file not found or already deleted:', story.image);
        }
      }
      if (story.video) {
        const videoPath = path.join('data', story.video);
        try {
          await fs.unlink(videoPath);
        } catch (err) {
          console.log('Video file not found or already deleted:', story.video);
        }
      }
    }
    
    // Remove all stories by this user
    const remainingStories = stories.filter(s => s.authorId !== userId);
    await writeJSON('data/stories.json', remainingStories);
    
    // Remove comments by this user from all stories
    for (const story of remainingStories) {
      if (story.comments && story.comments.length > 0) {
        story.comments = story.comments.filter(c => c.authorId !== userId);
      }
    }
    await writeJSON('data/stories.json', remainingStories);
    
    // Remove user account
    users.splice(userIndex, 1);
    await writeJSON('data/users.json', users);
    
    res.json({ 
      message: 'User and all related content deleted successfully',
      deletedUser: deletedUser.username,
      deletedStories: userStories.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Update story media (admin only)
app.put('/api/stories/:id/media', authenticateToken, isAdmin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const stories = await readJSON('data/stories.json');
    const storyIndex = stories.findIndex(s => s.id === req.params.id);

    if (storyIndex === -1) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const story = stories[storyIndex];

    // Delete old files if new ones are uploaded
    if (req.files?.image && story.image) {
      const oldImagePath = path.join('data', story.image);
      try {
        await fs.unlink(oldImagePath);
      } catch (err) {
        console.log('Old image not found or already deleted');
      }
    }

    if (req.files?.video && story.video) {
      const oldVideoPath = path.join('data', story.video);
      try {
        await fs.unlink(oldVideoPath);
      } catch (err) {
        console.log('Old video not found or already deleted');
      }
    }

    // Update with new files
    if (req.files?.image) {
      story.image = '/uploads/images/' + req.files.image[0].filename;
    }

    if (req.files?.video) {
      story.video = '/uploads/videos/' + req.files.video[0].filename;
    }

    story.updatedAt = new Date().toISOString();
    story.updatedBy = req.user.username;

    stories[storyIndex] = story;
    await writeJSON('data/stories.json', stories);

    res.json({
      message: 'Story media updated successfully',
      story: story
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Approve or reject story (admin only)
app.put('/api/stories/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const stories = await readJSON('data/stories.json');
    const storyIndex = stories.findIndex(s => s.id === req.params.id);

    if (storyIndex === -1) {
      return res.status(404).json({ error: 'Story not found' });
    }

    stories[storyIndex].status = status;
    stories[storyIndex].reviewedAt = new Date().toISOString();
    stories[storyIndex].reviewedBy = req.user.username;

    await writeJSON('data/stories.json', stories);

    res.json({
      message: `Story ${status} successfully`,
      story: stories[storyIndex]
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Increment story views (public - no auth required)
app.post('/api/stories/:id/view', async (req, res) => {
  try {
    const stories = await readJSON('data/stories.json');
    const storyIndex = stories.findIndex(s => s.id === req.params.id);

    if (storyIndex === -1) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const story = stories[storyIndex];
    const today = new Date().toISOString().split('T')[0];

    // Initialize view counters if they don't exist
    story.views = (story.views || 0) + 1;
    
    // Reset daily views if it's a new day
    if (story.lastViewDate !== today) {
      story.viewsToday = 1;
      story.lastViewDate = today;
    } else {
      story.viewsToday = (story.viewsToday || 0) + 1;
    }

    stories[storyIndex] = story;
    await writeJSON('data/stories.json', stories);

    res.json({
      message: 'View counted',
      views: story.views,
      viewsToday: story.viewsToday
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Like a story
app.post('/api/stories/:id/like', authenticateToken, async (req, res) => {
  try {
    const stories = await readJSON('data/stories.json');
    const storyIndex = stories.findIndex(s => s.id === req.params.id);

    if (storyIndex === -1) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const story = stories[storyIndex];
    
    // Initialize likedBy array if it doesn't exist
    if (!story.likedBy) {
      story.likedBy = [];
    }

    // Check if user already liked this story
    if (story.likedBy.includes(req.user.id)) {
      return res.status(400).json({ 
        error: 'You have already liked this story',
        alreadyLiked: true
      });
    }

    // Add user to likedBy array and increment likes
    story.likedBy.push(req.user.id);
    story.likes = story.likedBy.length;

    stories[storyIndex] = story;
    await writeJSON('data/stories.json', stories);

    res.json({
      message: 'Story liked',
      likes: story.likes,
      alreadyLiked: false
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Add comment to a story (authenticated users)
app.post('/api/stories/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const stories = await readJSON('data/stories.json');
    const storyIndex = stories.findIndex(s => s.id === req.params.id);

    if (storyIndex === -1) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const newComment = {
      id: 'comment-' + Date.now(),
      text: text.trim(),
      author: req.user.username,
      authorId: req.user.id,
      createdAt: new Date().toISOString()
    };

    // Initialize comments array if it doesn't exist
    if (!stories[storyIndex].comments) {
      stories[storyIndex].comments = [];
    }

    stories[storyIndex].comments.push(newComment);
    await writeJSON('data/stories.json', stories);

    res.json({
      message: 'Comment added successfully',
      comment: newComment,
      totalComments: stories[storyIndex].comments.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get comments for a story (public)
app.get('/api/stories/:id/comments', async (req, res) => {
  try {
    const stories = await readJSON('data/stories.json');
    const story = stories.find(s => s.id === req.params.id);

    if (!story) {
      return res.status(404).json({ error: 'Story not found' });
    }

    res.json({
      comments: story.comments || [],
      totalComments: (story.comments || []).length
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Delete comment (author or admin only)
app.delete('/api/stories/:storyId/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const stories = await readJSON('data/stories.json');
    const storyIndex = stories.findIndex(s => s.id === req.params.storyId);

    if (storyIndex === -1) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const story = stories[storyIndex];
    if (!story.comments) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const commentIndex = story.comments.findIndex(c => c.id === req.params.commentId);
    
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const comment = story.comments[commentIndex];

    // Check if user is comment author or admin
    if (comment.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    story.comments.splice(commentIndex, 1);
    stories[storyIndex] = story;
    await writeJSON('data/stories.json', stories);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Delete story (admin only)
app.delete('/api/stories/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const stories = await readJSON('data/stories.json');
    const storyIndex = stories.findIndex(s => s.id === req.params.id);

    if (storyIndex === -1) {
      return res.status(404).json({ error: 'Story not found' });
    }

    const story = stories[storyIndex];

    // Delete associated files
    if (story.image) {
      const imagePath = path.join('data', story.image);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.log('Image file not found or already deleted');
      }
    }

    if (story.video) {
      const videoPath = path.join('data', story.video);
      try {
        await fs.unlink(videoPath);
      } catch (err) {
        console.log('Video file not found or already deleted');
      }
    }

    stories.splice(storyIndex, 1);
    await writeJSON('data/stories.json', stories);

    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// ==================== CATEGORY MANAGEMENT ====================

// Helper function to add category to a file
async function addCategoryToFile(filePath, name, emoji) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let updated = false;

    // For HTML files (submit.html)
    if (filePath.endsWith('.html')) {
      // Find the last category option and add after it
      const lastCategoryPattern = /<div class="category-option" data-value="[^"]*">.*?<\/div>\s*(?=<\/div>)/s;
      const matches = content.match(new RegExp(lastCategoryPattern.source, 'g'));
      
      if (matches && matches.length > 0) {
        const lastCategory = matches[matches.length - 1];
        const newCategory = `\n              <div class="category-option" data-value="${name}">${emoji} ${name}</div>`;
        content = content.replace(lastCategory, lastCategory + newCategory);
        updated = true;
      }
    }
    
    // For JS files (submit.js and app.js)
    if (filePath.endsWith('.js')) {
      // Find the last category in CATEGORIES array and add after it
      const lastCategoryPattern = /\{\s*name:\s*['"][^'"]*['"]\s*,\s*emoji:\s*['"][^'"]*['"]\s*\}(?=\s*\])/;
      const match = content.match(lastCategoryPattern);
      
      if (match) {
        const newCategory = `,\n  { name: '${name}', emoji: '${emoji}' }`;
        content = content.replace(match[0], match[0] + newCategory);
        updated = true;
      }
    }

    if (updated) {
      await fs.writeFile(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error adding category to file ${filePath}:`, error);
    return false;
  }
}

// Helper function to remove category from a file
async function removeCategoryFromFile(filePath, name) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let updated = false;

    // For HTML files (submit.html)
    if (filePath.endsWith('.html')) {
      // Remove the category option line
      const categoryPattern = new RegExp(
        `\\s*<div class="category-option" data-value="${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">.*?<\\/div>`,
        'g'
      );
      
      if (categoryPattern.test(content)) {
        content = content.replace(categoryPattern, '');
        updated = true;
      }
    }
    
    // For JS files (submit.js and app.js)
    if (filePath.endsWith('.js')) {
      // Remove the category from CATEGORIES array
      const categoryPattern = new RegExp(
        `,?\\s*\\{\\s*name:\\s*['"]${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\s*,\\s*emoji:\\s*['"][^'"]*['"]\\s*\\}`,
        'g'
      );
      
      if (categoryPattern.test(content)) {
        content = content.replace(categoryPattern, '');
        // Clean up any double commas
        content = content.replace(/,\s*,/g, ',');
        updated = true;
      }
    }

    if (updated) {
      await fs.writeFile(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error removing category from file ${filePath}:`, error);
    return false;
  }
}

// Helper function to update category in a file
async function updateCategoryInFile(filePath, oldName, newName, emoji) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let updated = false;

    // For HTML files (submit.html)
    if (filePath.endsWith('.html')) {
      // Update data-value and display text
      const oldHtmlPattern = new RegExp(
        `<div class="category-option" data-value="${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">.*?${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</div>`,
        'g'
      );
      const newHtml = `<div class="category-option" data-value="${newName}">${emoji} ${newName}</div>`;
      
      if (oldHtmlPattern.test(content)) {
        content = content.replace(oldHtmlPattern, newHtml);
        updated = true;
      }
    }
    
    // For JS files (submit.js and app.js)
    if (filePath.endsWith('.js')) {
      // Update in CATEGORIES array: { name: 'Old Name', emoji: '😊' }
      const oldJsPattern = new RegExp(
        `\\{\\s*name:\\s*['"]${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]\\s*,\\s*emoji:\\s*['"][^'"]*['"]\\s*\\}`,
        'g'
      );
      const newJs = `{ name: '${newName}', emoji: '${emoji}' }`;
      
      if (oldJsPattern.test(content)) {
        content = content.replace(oldJsPattern, newJs);
        updated = true;
      }
    }

    if (updated) {
      await fs.writeFile(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error updating file ${filePath}:`, error);
    return false;
  }
}

// Rename category (admin only)
app.put('/api/admin/categories/rename', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { oldName, newName, emoji } = req.body;

    if (!oldName || !newName) {
      return res.status(400).json({ error: 'Old name and new name are required' });
    }

    // Read all stories
    const stories = await readJSON('data/stories.json');
    let updatedCount = 0;

    // Update categories in each story
    stories.forEach(story => {
      let storyUpdated = false;

      // Handle both old single category and new multiple categories format
      if (story.categories && Array.isArray(story.categories)) {
        // New format: multiple categories
        const updatedCategories = story.categories.map(cat => {
          if (cat === oldName) {
            storyUpdated = true;
            return newName;
          }
          return cat;
        });

        if (storyUpdated) {
          story.categories = updatedCategories;
          updatedCount++;
        }
      } else if (story.category === oldName) {
        // Old format: single category - convert to new format
        story.categories = [newName];
        delete story.category;
        storyUpdated = true;
        updatedCount++;
      }
    });

    // Save updated stories
    await writeJSON('data/stories.json', stories);

    // Update frontend files automatically
    const filesToUpdate = [
      'frontend/submit.html',
      'frontend/js/submit.js',
      'frontend/js/app.js'
    ];

    let filesUpdated = 0;
    for (const file of filesToUpdate) {
      const updated = await updateCategoryInFile(file, oldName, newName, emoji);
      if (updated) filesUpdated++;
    }

    res.json({ 
      message: 'Category renamed successfully',
      oldName: oldName,
      newName: newName,
      emoji: emoji,
      updatedStories: updatedCount,
      filesUpdated: filesUpdated,
      totalFiles: filesToUpdate.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Add new category (admin only)
app.post('/api/admin/categories', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { name, emoji } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Update frontend files automatically
    const filesToUpdate = [
      'frontend/submit.html',
      'frontend/js/submit.js',
      'frontend/js/app.js'
    ];

    let filesUpdated = 0;
    for (const file of filesToUpdate) {
      const updated = await addCategoryToFile(file, name, emoji || '📂');
      if (updated) filesUpdated++;
    }

    res.json({ 
      message: 'Category added successfully',
      name: name,
      emoji: emoji || '📂',
      filesUpdated: filesUpdated,
      totalFiles: filesToUpdate.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Delete category (admin only)
app.delete('/api/admin/categories/:name', authenticateToken, isAdmin, async (req, res) => {
  try {
    const categoryName = decodeURIComponent(req.params.name);

    // Read all stories
    const stories = await readJSON('data/stories.json');
    let updatedCount = 0;

    // Remove category from all stories
    stories.forEach(story => {
      if (story.categories && Array.isArray(story.categories)) {
        const originalLength = story.categories.length;
        story.categories = story.categories.filter(cat => cat !== categoryName);
        
        if (story.categories.length < originalLength) {
          updatedCount++;
        }
      } else if (story.category === categoryName) {
        // Old format: remove the category field
        delete story.category;
        story.categories = [];
        updatedCount++;
      }
    });

    // Save updated stories
    await writeJSON('data/stories.json', stories);

    // Remove from frontend files automatically
    const filesToUpdate = [
      'frontend/submit.html',
      'frontend/js/submit.js',
      'frontend/js/app.js'
    ];

    let filesUpdated = 0;
    for (const file of filesToUpdate) {
      const updated = await removeCategoryFromFile(file, categoryName);
      if (updated) filesUpdated++;
    }

    res.json({ 
      message: 'Category deleted successfully',
      categoryName: categoryName,
      updatedStories: updatedCount,
      filesUpdated: filesUpdated,
      totalFiles: filesToUpdate.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║         🌹 Romantic Golpo Server 🌹              ║
║                                                   ║
║   Server running at: http://localhost:${PORT}      ║
║                                                   ║
║   Default Admin Credentials:                     ║
║   Username: admin                                ║
║   Password: admin123                             ║
║                                                   ║
║   All data saved in: ./data/                     ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
});
