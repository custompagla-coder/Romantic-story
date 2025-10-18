# 🌹 Choti Golpo - Story Sharing Platform

A complete web application for reading and posting romantic stories. Features include user authentication, admin moderation, comments, likes, profile pictures, and customizable branding.

## ✨ Features

- **User Authentication**: Sign up, login, and logout functionality
- **Story Submission**: Users can submit stories with title, content, images, and videos
- **Admin Panel**: Approve or reject submitted stories before they go live
- **Story Display**: Beautiful card-based layout for browsing stories
- **Story Details**: Full story view with images, videos, and like functionality (one like per user)
- **Comment System**: Users can comment on stories, view all comments, and delete their own comments
- **View Counter**: Automatic view tracking for each story with total views and daily views
- **Story Filters**: Filter buttons to sort stories by All, Latest, Popular, Top Rated, or Trending
- **Search**: Search stories by title, author, or content
- **Dark/Light Mode**: Toggle between modern dark theme and romantic light theme with a floating button
- **Offline Storage**: All data stored locally in JSON files and uploads folder
- **Responsive Design**: Works on desktop and mobile devices
- **Romantic Theme**: Beautiful pink and rose color scheme with elegant typography

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. Navigate to the project directory:
```bash
cd romantic-golpo
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and go to:
```
http://localhost:5000
```

## 👤 Default Admin Account

- **Username**: `admin`
- **Password**: `admin123`

Use these credentials to access the admin panel and approve/reject stories.

## 📁 Project Structure

```
romantic-golpo/
│
├── frontend/               # Frontend files
│   ├── index.html         # Home page (story list)
│   ├── story.html         # Individual story view
│   ├── login.html         # Login/Signup page
│   ├── submit.html        # Story submission page
│   ├── admin.html         # Admin dashboard
│   ├── js/
│   │   ├── app.js         # Home page logic
│   │   ├── auth.js        # Authentication logic
│   │   ├── submit.js      # Story submission logic
│   │   └── admin.js       # Admin panel logic
│   └── css/
│       └── style.css      # All styles
│
├── data/                  # Local data storage
│   ├── stories.json       # All stories
│   ├── users.json         # User accounts
│   └── uploads/           # Uploaded media files
│       ├── images/        # Story images
│       └── videos/        # Story videos
│
├── server.js              # Express server
├── package.json           # Dependencies
└── README.md             # This file
```

## 🎯 How to Use

### For Users

1. **Sign Up**: Create an account on the login page
2. **Browse Stories**: View approved romantic stories on the home page with filter buttons
   - **📚 ALL STORIES**: View all stories sorted by newest first
   - **🆕 LATEST**: Browse latest stories (newest first)
   - **⭐ POPULAR**: See most viewed stories of all time
   - **❤️ TOP RATED**: View stories with the most likes
   - **🔥 TRENDING**: See most viewed stories today
   - **👤 POPULAR AUTHORS**: View authors ranked by total views
     - Click on any author to see all their stories
     - Stories sorted by latest first
3. **Read Stories**: Click "Read More" to view full stories with images/videos
   - View counter automatically increments when you open a story
   - See total views and like count for each story
   - Read comments from other users
   - Post your own comments (requires login)
   - Delete your own comments
4. **Like Stories**: Click the heart icon to like a story (requires login)
   - Each user can only like a story once
   - Like button becomes disabled after liking
   - Like count updates in real-time
5. **Submit Story**: Click "Submit Story" in the navigation to share your own story
   - Story title (required)
   - Short introduction (optional, max 20 words with live word counter)
   - Full story content (required)
   - Optional image and video uploads
6. **Search**: Use the search bar to find stories by title, author, or content

### For Admin

1. **Login**: Use the admin credentials to login
2. **Access Admin Panel**: Click "Admin Panel" in the navigation
3. **View Statistics**: See total, pending, approved, and rejected stories
4. **Review Stories**: View pending stories and their content
5. **Edit Media**: Change story images and videos
   - Click "View" button on any story
   - Click "Change Image" or "Change Video" buttons
   - Upload new media files
   - Old files are automatically deleted
6. **Approve/Reject**: Approve stories to make them public or reject them
7. **Delete Stories**: Permanently remove stories if needed
8. **Filter**: Use filter buttons to view stories by status

## 🔧 API Endpoints

### Authentication
- `POST /api/signup` - Create new user account
- `POST /api/login` - Login user
- `GET /api/user` - Get current user info

### Stories (Public)
- `GET /api/stories` - Get all approved stories
- `GET /api/stories/:id` - Get single story by ID
- `POST /api/stories/:id/view` - Increment story view counter (no auth required)

### Stories (Authenticated)
- `POST /api/stories` - Submit new story (with file upload)
- `POST /api/stories/:id/like` - Like a story
- `POST /api/stories/:id/comments` - Add comment to a story
- `DELETE /api/stories/:storyId/comments/:commentId` - Delete own comment (or any comment if admin)

### Comments (Public)
- `GET /api/stories/:id/comments` - Get all comments for a story

### Admin Only
- `GET /api/admin/stories` - Get all stories (including pending)
- `PUT /api/stories/:id/media` - Update story image/video (with file upload)
- `PUT /api/stories/:id/status` - Approve or reject story
- `DELETE /api/stories/:id` - Delete story

## 💾 Data Storage

All data is stored locally in the `/data/` folder:

- **users.json**: User accounts with hashed passwords
- **stories.json**: All stories with metadata (including view counters)
- **uploads/images/**: Uploaded story images
- **uploads/videos/**: Uploaded story videos

Data persists across server restarts and can be backed up by copying the `/data/` folder.

### 📊 View Counter System

Each story tracks:
- **Total Views** (`views`): All-time view count
- **Daily Views** (`viewsToday`): Views in the current day
- **Last View Date** (`lastViewDate`): Automatically resets daily counter at midnight

The view counter:
- Increments automatically when someone opens a story
- No authentication required to count views
- Daily views reset at midnight (server-side)
- Powers the "🔥 Trending Today" section (shows top 3 most viewed stories today)
- Powers the "⭐ Most Popular" section (shows top 6 all-time most viewed stories)

## 🎨 Customization

### Dark/Light Mode Toggle

A floating button appears on every page (bottom-right corner) to switch between themes:
- **Light Mode**: Romantic pink and rose color scheme with cream background
- **Dark Mode**: Modern dark theme with deep blues and maintained pink accents
- Theme preference is saved in browser's localStorage and persists across sessions
- Click the 🌙 (moon) icon to switch to dark mode
- Click the ☀️ (sun) icon to switch back to light mode

### Change Colors

Edit `frontend/css/style.css` and modify the CSS variables:

```css
:root {
  --primary: #ff6b9d;        /* Main pink color */
  --primary-dark: #e85a8a;   /* Darker pink */
  --secondary: #ffc2d1;      /* Light pink */
  --accent: #fff0f3;         /* Very light pink */
  --cream: #fff5f7;          /* Background cream */
}

/* For dark mode colors */
body.dark-mode {
  --bg-gradient-start: #0f0f1e;
  --bg-gradient-end: #1a1a2e;
  --card-bg: #16213e;
  /* ... other dark mode variables */
}
```

### Change Port

Edit `server.js` and change the PORT constant:

```javascript
const PORT = 5000; // Change to your desired port
```

## 🔒 Security Notes

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- File uploads are validated and stored securely
- Admin routes are protected with role-based access control

## 📦 Deployment

### Quick Deployment

**See `HOSTING-GUIDE.md` for detailed step-by-step instructions!**

**Recommended:** Deploy to Render.com (Free)
1. Push code to GitHub
2. Connect to Render.com
3. Deploy automatically
4. Your site is live!

**Full guide with 5 hosting options available in `HOSTING-GUIDE.md`**

### Local Sharing

To share locally:
1. Stop the server
2. Zip the entire folder
3. Share the zip file
4. Recipients run `npm install` then `npm start`

## 🐛 Troubleshooting

### Server won't start
- Make sure Node.js is installed: `node --version`
- Check if port 5000 is available
- Run `npm install` to install dependencies

### Stories not loading
- Make sure the server is running
- Check browser console for errors
- Verify `data/stories.json` exists and is valid JSON

### Can't upload files
- Check that `data/uploads/images/` and `data/uploads/videos/` folders exist
- Verify file size is under 100MB
- Check file format (images: jpg, png, gif; videos: mp4, webm, ogg)

### Admin can't login
- Use username: `admin` and password: `admin123`
- Check `data/users.json` contains the admin user

## 📝 License

MIT License - Feel free to use and modify for your projects!

## 💖 Credits

Built with love using:
- Node.js & Express
- Vanilla JavaScript
- Custom CSS with romantic theme
- Local file storage (no database required)

---

**Enjoy sharing romantic stories! 🌹💕**
