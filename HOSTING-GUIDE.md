# 🚀 Complete Hosting Guide - Choti Golpo

## 📋 Pre-Hosting Checklist

Before hosting, ensure:
- ✅ All features tested locally
- ✅ Admin account created (username: admin, password: admin123)
- ✅ No console errors in browser
- ✅ All pages load correctly
- ✅ File uploads working
- ✅ Dark/Light mode working

---

## 🌐 Hosting Options

### Option 1: Render.com (Recommended - FREE)

**Best for:** Full-stack apps with backend

#### Step-by-Step:

1. **Create Account**
   - Go to https://render.com
   - Sign up with GitHub/Email

2. **Prepare Your Code**
   ```bash
   # Initialize git if not already done
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Push to GitHub**
   - Create a new repository on GitHub
   - Push your code:
   ```bash
   git remote add origin https://github.com/yourusername/choti-golpo.git
   git branch -M main
   git push -u origin main
   ```

4. **Deploy on Render**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** choti-golpo
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Plan:** Free

5. **Add Environment Variables**
   - Go to "Environment" tab
   - Add:
     ```
     JWT_SECRET=your-super-secret-random-string-here
     NODE_ENV=production
     ```

6. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - Your site will be live at: `https://choti-golpo.onrender.com`

**Pros:**
- ✅ Free forever
- ✅ Auto-deploys from GitHub
- ✅ SSL certificate included
- ✅ Easy to use

**Cons:**
- ⚠️ Sleeps after 15 min inactivity (wakes up in ~30 seconds)
- ⚠️ 750 hours/month free tier

---

### Option 2: Railway.app (Easy & Fast)

**Best for:** Quick deployment

#### Steps:

1. **Create Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway auto-detects Node.js

3. **Add Environment Variables**
   - Go to Variables tab
   - Add:
     ```
     JWT_SECRET=your-secret-key
     NODE_ENV=production
     ```

4. **Generate Domain**
   - Go to Settings → Networking
   - Click "Generate Domain"
   - Your site: `https://choti-golpo.up.railway.app`

**Pros:**
- ✅ $5 free credit monthly
- ✅ Fast deployment
- ✅ No sleep mode
- ✅ Auto SSL

---

### Option 3: Heroku (Popular)

**Best for:** Production apps

#### Steps:

1. **Install Heroku CLI**
   ```bash
   # Download from: https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   heroku create choti-golpo
   ```

4. **Add Procfile**
   Create file named `Procfile` (no extension):
   ```
   web: node server.js
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set NODE_ENV=production
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

7. **Open App**
   ```bash
   heroku open
   ```

**Pros:**
- ✅ Reliable
- ✅ Good documentation
- ✅ Add-ons available

**Cons:**
- ⚠️ No longer has free tier
- ⚠️ Requires credit card

---

### Option 4: Vercel (Frontend) + Backend Separately

**Best for:** If you want to separate frontend and backend

#### Frontend on Vercel:

1. **Deploy Frontend**
   - Go to https://vercel.com
   - Import your GitHub repo
   - Set Root Directory: `frontend`
   - Deploy

2. **Update API URL**
   - Edit `frontend/js/config.js`:
   ```javascript
   const API_URL = 'https://your-backend-url.com/api';
   ```

#### Backend on Render/Railway:
- Follow Option 1 or 2 for backend only

---

### Option 5: VPS (Full Control)

**Best for:** Advanced users, high traffic

#### Providers:
- DigitalOcean ($4/month)
- Linode ($5/month)
- Vultr ($2.50/month)
- AWS EC2 (Free tier 1 year)

#### Steps:

1. **Create Ubuntu Server**
   - Choose Ubuntu 20.04 or 22.04

2. **Connect via SSH**
   ```bash
   ssh root@your-server-ip
   ```

3. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PM2**
   ```bash
   sudo npm install -g pm2
   ```

5. **Upload Your Code**
   ```bash
   git clone https://github.com/yourusername/choti-golpo.git
   cd choti-golpo
   npm install --production
   ```

6. **Create .env File**
   ```bash
   nano .env
   ```
   Add:
   ```
   PORT=5000
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   ```

7. **Start with PM2**
   ```bash
   pm2 start server.js --name choti-golpo
   pm2 save
   pm2 startup
   ```

8. **Install Nginx**
   ```bash
   sudo apt install nginx
   ```

9. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/choti-golpo
   ```
   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

10. **Enable Site**
    ```bash
    sudo ln -s /etc/nginx/sites-available/choti-golpo /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

11. **Install SSL (Let's Encrypt)**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

---

## 🔧 Post-Deployment Configuration

### 1. Update API URL

Edit `frontend/js/config.js`:
```javascript
const API_URL = 'https://your-domain.com/api';
```

Then update in all files that use it:
- `frontend/js/app.js`
- `frontend/js/admin.js`
- `frontend/js/submit.js`
- `frontend/js/profile.js`
- `frontend/story.html`

### 2. Change JWT Secret

**IMPORTANT:** Change the JWT secret to a random string:
```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Set it in your hosting platform's environment variables.

### 3. Test Everything

- ✅ User registration
- ✅ Login/Logout
- ✅ Story submission
- ✅ Image upload
- ✅ Admin panel access
- ✅ Story approval/rejection
- ✅ Comments
- ✅ Likes
- ✅ Search
- ✅ Pagination
- ✅ Dark/Light mode
- ✅ Mobile menu
- ✅ Profile pictures
- ✅ Logo customization

---

## 📊 Monitoring & Maintenance

### Check Logs

**Render:**
- Go to your service → Logs tab

**Railway:**
- Click on deployment → View logs

**Heroku:**
```bash
heroku logs --tail
```

**VPS:**
```bash
pm2 logs choti-golpo
```

### Restart Server

**Render/Railway:** Auto-restarts

**Heroku:**
```bash
heroku restart
```

**VPS:**
```bash
pm2 restart choti-golpo
```

---

## 🔒 Security Best Practices

1. **Change Default Admin Password**
   - Login as admin
   - Change password immediately

2. **Use Strong JWT Secret**
   - Never use default secret in production
   - Generate random 64+ character string

3. **Enable HTTPS**
   - Most platforms provide free SSL
   - Force HTTPS redirect

4. **Regular Backups**
   - Backup `data/` folder weekly
   - Download via FTP/SFTP or use hosting backup features

5. **Update Dependencies**
   ```bash
   npm update
   npm audit fix
   ```

---

## 🐛 Troubleshooting

### Site Not Loading
- Check if server is running
- Check logs for errors
- Verify environment variables

### Images Not Showing
- Check `data/uploads/` folder exists
- Verify file permissions (755)
- Check upload path in code

### Can't Login
- Clear browser cache
- Check JWT_SECRET is set
- Verify `data/users.json` exists

### Database Issues
- Check `data/` folder permissions
- Verify JSON files are valid
- Restore from backup if corrupted

---

## 📞 Support

If you face issues:
1. Check logs first
2. Verify all environment variables
3. Test locally first
4. Check hosting platform status page

---

## 🎉 You're Live!

Once deployed, share your site:
- 🌐 Your URL: `https://your-domain.com`
- 👤 Admin Login: `admin` / `admin123`
- 📱 Mobile-friendly
- 🌙 Dark mode enabled by default

**Congratulations! Your Choti Golpo website is now live! 🚀✨**
