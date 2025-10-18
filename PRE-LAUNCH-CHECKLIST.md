# ✅ Pre-Launch Checklist - Choti Golpo

## 🔍 Final Testing (Do This Before Hosting!)

### Authentication & Users
- [ ] User can register with email and password
- [ ] User can login successfully
- [ ] User can logout
- [ ] Admin can login (username: admin, password: admin123)
- [ ] Profile pictures upload and display correctly
- [ ] User profile page shows correct information

### Story Management
- [ ] User can submit a story with title and content
- [ ] User can upload image with story
- [ ] Story appears in admin panel as "Pending"
- [ ] Admin can approve story
- [ ] Approved story appears on home page
- [ ] Admin can reject story
- [ ] Admin can delete story
- [ ] Story detail page loads correctly
- [ ] Story content is not copyable (right-click disabled)

### Admin Panel
- [ ] Admin panel is accessible only to admin user
- [ ] Story statistics show correct counts
- [ ] User management shows all users
- [ ] Admin can delete users
- [ ] Website logo can be uploaded
- [ ] Website name can be changed
- [ ] Logo and name update across all pages

### Interactions
- [ ] Users can like stories (once per story)
- [ ] Like count updates correctly
- [ ] Users can comment on stories
- [ ] Comments display with username and timestamp
- [ ] Users can delete their own comments
- [ ] Admin can delete any comment
- [ ] View counter increments on story view

### Navigation & UI
- [ ] Home page loads all approved stories
- [ ] Pagination works (10 stories per page)
- [ ] Search finds stories by title/author/content
- [ ] Category filter works (18 categories)
- [ ] Filter buttons work (All, Latest, Popular, etc.)
- [ ] Popular authors section displays correctly
- [ ] Mobile hamburger menu opens from top
- [ ] Mobile menu X button closes menu
- [ ] Dark/Light mode toggle works
- [ ] Dark mode is default
- [ ] All text visible in both themes

### Mobile Responsiveness
- [ ] Site looks good on phone (375px width)
- [ ] Site looks good on tablet (768px width)
- [ ] Hamburger menu works smoothly
- [ ] All buttons are tap-friendly
- [ ] Images scale correctly
- [ ] Text is readable on small screens

### Performance
- [ ] Pages load within 3 seconds
- [ ] Images are optimized
- [ ] No console errors in browser
- [ ] No broken links
- [ ] All API calls work correctly

---

## 🔧 Code Quality

### Files Check
- [ ] No unused files in project
- [ ] All console.log() removed from production code
- [ ] No hardcoded localhost URLs (use config.js)
- [ ] .gitignore file present
- [ ] .env.example file present
- [ ] README.md is up to date

### Security
- [ ] JWT_SECRET will be changed in production
- [ ] Passwords are hashed (bcrypt)
- [ ] File upload validation in place
- [ ] Admin routes are protected
- [ ] No sensitive data in code

---

## 📝 Configuration

### Before Hosting
- [ ] Update API_URL in `frontend/js/config.js`
- [ ] Set strong JWT_SECRET in environment variables
- [ ] Set NODE_ENV=production
- [ ] Test with production API URL locally first

### Environment Variables Needed
```
PORT=5000
JWT_SECRET=your-super-secret-random-string
NODE_ENV=production
```

---

## 📦 Files to Deploy

### Required Files
- ✅ `server.js`
- ✅ `package.json`
- ✅ `frontend/` folder (all files)
- ✅ `data/` folder structure
- ✅ `.env.example`
- ✅ `README.md`
- ✅ `HOSTING-GUIDE.md`

### Optional Files (Don't Deploy)
- ❌ `node_modules/` (will be installed on server)
- ❌ `.env` (create on server)
- ❌ `.git/` (if using GitHub deployment)
- ❌ `data/uploads/` (optional - will be created)

---

## 🚀 Deployment Steps

1. **Choose Hosting Platform**
   - Render.com (Recommended - Free)
   - Railway.app (Easy)
   - Heroku (Paid)
   - VPS (Advanced)

2. **Prepare Code**
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   ```

3. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/choti-golpo.git
   git push -u origin main
   ```

4. **Deploy**
   - Follow steps in `HOSTING-GUIDE.md`

5. **Post-Deployment**
   - Update API_URL to production URL
   - Test all features again
   - Change admin password
   - Share your site!

---

## 🎯 Success Criteria

Your site is ready when:
- ✅ All checklist items above are completed
- ✅ No errors in browser console
- ✅ All features work on mobile and desktop
- ✅ Site loads fast (< 3 seconds)
- ✅ Admin panel is accessible and functional
- ✅ Users can register, login, and submit stories
- ✅ Stories can be approved and displayed
- ✅ Comments and likes work
- ✅ Dark mode is default and works perfectly

---

## 📞 If Something Doesn't Work

1. Check browser console for errors
2. Check server logs
3. Verify environment variables
4. Test locally first
5. Review `HOSTING-GUIDE.md` troubleshooting section

---

**Once all items are checked, you're ready to host! 🚀**

Good luck with your launch! 🎉
