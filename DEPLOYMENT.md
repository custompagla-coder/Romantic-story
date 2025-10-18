# 🚀 Deployment Guide - Choti Golpo

## Production Deployment Steps

### 1. Update API URL

Edit `frontend/js/config.js`:
```javascript
// Change from:
const API_URL = 'http://localhost:5000/api';

// To your production domain:
const API_URL = 'https://yourdomain.com/api';
```

### 2. Update All JavaScript Files

Replace `const API_URL = 'http://localhost:5000/api';` in these files:
- `frontend/js/app.js`
- `frontend/js/admin.js`
- `frontend/js/submit.js`
- `frontend/js/profile.js`
- `frontend/story.html` (inline script)

### 3. Server Configuration

For production, update `server.js`:
```javascript
const PORT = process.env.PORT || 5000;
```

### 4. Environment Variables

Create a `.env` file:
```
PORT=5000
JWT_SECRET=your-secure-random-secret-key-here
NODE_ENV=production
```

### 5. Security Checklist

- ✅ Change JWT_SECRET to a strong random string
- ✅ Enable HTTPS on your server
- ✅ Set up proper CORS policies
- ✅ Configure rate limiting
- ✅ Set up file upload limits
- ✅ Enable security headers

### 6. Hosting Options

#### Option A: VPS (DigitalOcean, Linode, AWS EC2)
1. Upload files to server
2. Install Node.js
3. Run `npm install --production`
4. Use PM2 to keep server running:
   ```bash
   npm install -g pm2
   pm2 start server.js --name choti-golpo
   pm2 save
   pm2 startup
   ```

#### Option B: Heroku
1. Create `Procfile`:
   ```
   web: node server.js
   ```
2. Deploy:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

#### Option C: Vercel/Netlify (Frontend) + Backend Separately
- Deploy frontend as static site
- Deploy backend on separate service
- Update API_URL accordingly

### 7. Database Migration (Optional)

For production, consider migrating from JSON files to a real database:
- MongoDB
- PostgreSQL
- MySQL

### 8. Backup Strategy

Set up automated backups for:
- `/data/users.json`
- `/data/stories.json`
- `/data/uploads/` folder

### 9. Monitoring

Set up monitoring for:
- Server uptime
- Error logs
- Performance metrics
- User activity

### 10. Domain & SSL

- Purchase domain name
- Configure DNS
- Install SSL certificate (Let's Encrypt)
- Force HTTPS redirect

## Post-Deployment Checklist

- [ ] Test user registration
- [ ] Test login/logout
- [ ] Test story submission
- [ ] Test admin panel
- [ ] Test file uploads
- [ ] Test comments system
- [ ] Test pagination
- [ ] Test search functionality
- [ ] Test dark/light mode
- [ ] Test mobile responsiveness
- [ ] Test profile pictures
- [ ] Test logo customization
- [ ] Verify copy protection works
- [ ] Check all page titles
- [ ] Verify SEO meta tags
- [ ] Test user deletion (admin)

## Performance Optimization

1. Enable gzip compression
2. Minify CSS/JS files
3. Optimize images
4. Enable browser caching
5. Use CDN for static assets

## Maintenance

- Regular backups
- Monitor error logs
- Update dependencies
- Security patches
- Performance monitoring

---

**Ready to deploy? Good luck! 🚀**
