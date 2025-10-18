# Testing Category Counts Feature

## How to Test

### 1. Start the Server
```bash
node server.js
```

### 2. Open Browser
Go to: `http://localhost:5000`

### 3. Open Browser Console
- Press `F12` or `Right-click` → `Inspect`
- Go to `Console` tab

### 4. Check for Logs
You should see:
```
Category stats loaded: [...]
Category buttons rendered successfully
```

### 5. Click "📂 CATEGORIES" Button
- Category buttons should appear
- Each should show count: `💕 First Love (X)`
- Most popular categories should be at top

### 6. Check Submit Page
- Go to: `http://localhost:5000/submit.html`
- Login if needed
- Click category dropdown
- Should show counts: `💕 First Love (X)`

## Troubleshooting

### If counts don't show:

1. **Check Console for Errors**
   - Look for red error messages
   - Check if API call succeeded

2. **Verify Server is Running**
   ```bash
   # Should see: Server running on port 5000
   ```

3. **Check API Endpoint**
   - Open: `http://localhost:5000/api/categories/stats`
   - Should see JSON array with counts

4. **Clear Browser Cache**
   - Press `Ctrl + Shift + R` (hard refresh)
   - Or clear cache in browser settings

5. **Check if Stories Exist**
   - Need at least 1 approved story
   - Check `data/stories.json`
   - Approve stories in admin panel

### Expected API Response:
```json
[
  { "name": "First Love", "count": 50 },
  { "name": "Heartbreak", "count": 35 },
  { "name": "Marriage", "count": 28 }
]
```

### If Still Not Working:

1. Restart server
2. Clear browser cache
3. Check console logs
4. Verify `data/stories.json` has approved stories
5. Check that stories have `categories` field

## Success Indicators

✅ Console shows: "Category stats loaded"
✅ Console shows: "Category buttons rendered successfully"
✅ Category buttons show counts: `💕 First Love (50)`
✅ Categories sorted by popularity
✅ Submit page dropdown shows counts
✅ No errors in console
