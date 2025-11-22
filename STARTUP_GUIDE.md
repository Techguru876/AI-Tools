# ContentForge Studio - Startup Guide (Windows)

## Current Status

✅ **Fixed**: SQLite database directory creation
✅ **Fixed**: TypeScript compilation (0 errors)
⚠️ **Issue**: Canvas module rebuild failing (not needed - legacy PhotoVideo Pro only)
⚠️ **Issue**: Tauri imports in legacy code (being loaded by Vite)

---

## Quick Start (Recommended)

Run these commands in PowerShell:

```powershell
# 1. Rebuild ONLY better-sqlite3 (skip canvas and other legacy modules)
npx @electron/rebuild -v 28.0.0 -w better-sqlite3 -f

# 2. Compile main process
npm run compile:main

# 3. Start the app
npm run dev
```

---

## If You Still Get Errors

### Error: "canvas.h: No such file or directory"

**Cause**: `@electron/rebuild` is trying to rebuild the `canvas` module (legacy PhotoVideo Pro dependency)

**Solution**: Use the `-w` flag to ONLY rebuild better-sqlite3:

```powershell
npx @electron/rebuild -v 28.0.0 -w better-sqlite3 -f
```

The `-w better-sqlite3` flag tells it to rebuild ONLY that module, skipping canvas.

---

### Error: "Port 5173 is already in use"

**Solution**: Kill the process using that port:

```powershell
# Find the process
netstat -ano | findstr :5173

# Kill it (replace <PID> with the number from the last column)
taskkill /F /PID <PID>
```

---

### Error: "@tauri-apps/api/tauri" not found (Vite errors)

**Status**: This is expected - the legacy PhotoVideo Pro code has Tauri imports, but we've disabled that mode.

**Why it appears**: Vite pre-scans all TypeScript files even if they're not loaded.

**Impact**: None - the app will still work. These files aren't actually loaded because we disabled "Pro Mode" in `src/main.tsx`.

**Optional Fix** (if you want to remove the warnings):
- The app works fine with these warnings
- They only appear during startup and don't affect functionality

---

## What's Running

When you run `npm run dev`, you'll see:

1. **Vite dev server** (port 5173) - React frontend
2. **Electron window** - Desktop app

The app should open with **ContentForge Studio** and 10 video generation studios available.

---

## Expected Startup Output

```
[0] VITE v5.4.21  ready in 276 ms
[0] ➜  Local:   http://localhost:5173/
[0] ➜  Network: use --host to expose

[1] (Electron window opens with ContentForge Studio)
```

You may see some Vite warnings about Tauri imports - **these are safe to ignore**.

---

## Project Structure

```
ContentForge Studio (Main App) ✅
├── ContentForge - AI automation dashboard
├── Lofi Studio - Ambient music videos
├── Quotes Studio - Motivational quotes
├── Explainer Studio - Educational content
├── ASMR Studio - Relaxation content
├── Horror Studio - Horror stories
├── News Studio - News compilations
└── ... 3 more studios

PhotoVideo Pro (Disabled) ⚠️
└── Legacy Tauri-based editor (not loaded)
```

---

## Configuration

Once the app starts:

1. Click **⚙️ Settings** in ContentForge Studio
2. Add your API keys:
   - **OpenAI API Key** (required for AI content generation)
   - **ElevenLabs API Key** (optional - premium voices)
   - **YouTube OAuth** (optional - direct uploads)

---

## Troubleshooting

### App starts but shows blank screen

- Check the Electron console (Help → Toggle Developer Tools)
- Look for JavaScript errors
- Database files will be created in: `C:\Users\<YourUser>\ContentForge\`

### "Cannot open database" error

- Fixed in latest code
- Recompile: `npm run compile:main`
- Database directories are now created automatically

### TypeScript compilation errors

```powershell
# Check for errors
npm run compile:main

# If errors appear, they'll show file:line numbers
# Report them and I'll help fix
```

---

## What We Fixed

1. **✅ better-sqlite3 Node Module**
   - Was compiled for Node v115
   - Rebuilt for Electron 28 (Node v119)
   - Must use Windows-specific rebuild

2. **✅ Database Directory Creation**
   - SQLite failed: "directory does not exist"
   - Fixed: directories created synchronously before database
   - Affects: ProjectService, TemplateEngine

3. **✅ TypeScript Compilation**
   - Missing @types/node
   - Added dev dependency
   - All code compiles successfully

---

## Next Steps

After the app starts successfully:

1. **Explore ContentForge Studio** - Main AI automation dashboard
2. **Try other studios** - Lofi, Quotes, Explainer, etc.
3. **Generate test content** - Use the AI features
4. **Configure YouTube** - Set up OAuth for uploads (optional)

---

## Still Having Issues?

Provide the **full error output** from PowerShell and I'll help debug further.

Most common issues:
- ❌ Ran `npx @electron/rebuild` without `-w better-sqlite3` flag
- ❌ Port 5173 in use from previous session
- ❌ Missing Visual Studio Build Tools (for node-gyp)

---

## Success Checklist

- [ ] `npx @electron/rebuild -v 28.0.0 -w better-sqlite3 -f` completed
- [ ] `npm run compile:main` shows no errors
- [ ] `npm run dev` starts Vite (port 5173)
- [ ] Electron window opens with ContentForge Studio
- [ ] Can see 10 studios in the sidebar

**If all checked - you're ready to go!** 🚀
