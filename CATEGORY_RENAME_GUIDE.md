# Category Rename Feature - User Guide

## Overview
The Category Management feature allows admins to rename categories from the admin panel. When you rename a category, **EVERYTHING is automatically updated** - database, frontend files, and all stories!

## How to Use (Super Simple!)

### Step 1: Access Category Management
1. Login as admin
2. Go to **Admin Panel**
3. Click on the **📂 Category Management** tab

### Step 2: Rename a Category
1. Find the category you want to rename
2. Click the **✏️ Rename** button
3. Edit the category name and/or emoji
4. Click **💾 Save Changes**
5. Confirm the action

### Step 3: Done! ✅
**That's it!** Everything is automatically updated:
- ✅ All stories in the database
- ✅ `frontend/submit.html` 
- ✅ `frontend/js/submit.js`
- ✅ `frontend/js/app.js`

**No manual editing required!** 🎉

## What Gets Updated Automatically

✅ **Database** - All stories with the old category name → new name
✅ **submit.html** - Category dropdown options updated
✅ **submit.js** - CATEGORIES array updated
✅ **app.js** - Categories array updated
✅ **Story counts** - Category statistics recalculated
✅ **Emojis** - Category emojis updated everywhere

## Example: Renaming "First Love" to "True Love"

### Before:
- 15 stories with category "First Love" 💕

### Action:
1. Go to Admin Panel → Category Management
2. Click "Rename" on "First Love"
3. Change to "True Love" 
4. Click "Save Changes"

### After (Automatic):
- ✅ 15 stories now show "True Love"
- ✅ submit.html updated
- ✅ submit.js updated
- ✅ app.js updated
- ✅ All frontend dropdowns show "True Love"
- ✅ New stories can use "True Love"

**Total manual work: ZERO lines of code!** 🚀

## Benefits

- ✅ No stories are lost or unattached
- ✅ All existing stories automatically use the new category name
- ✅ Easy to use interface
- ✅ Shows how many stories will be affected before confirming
- ✅ Can also update the emoji for each category

## Notes

- Only admins can rename categories
- The system creates a backup before making changes
- You can rename a category as many times as you want
- Category names are case-sensitive
- Emojis are optional but recommended for better UX
