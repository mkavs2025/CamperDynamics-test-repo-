# Deploying Camper Dynamics to Vercel

This repository is fully configured and ready for 1-click deployment on [Vercel](https://vercel.com).

---

## Quick Deploy (Vercel Dashboard)

### Method A: Push to GitHub & Import
1. Push this project to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Vercel ready"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. Go to **[vercel.com/new](https://vercel.com/new)**.
3. Import your GitHub repository.
4. **Project Settings:**
   - **Framework Preset**: `Next.js` (detected automatically)
   - **Root Directory**:
     - If you pushed the whole workspace folder, select **`CamperDynamics`** (or leave root as the root `vercel.json` will route to it).
     - If you pushed just the contents of `CamperDynamics`, leave it as `./`.
   - **Build Command**: `npm run build` (or auto-detected from `vercel.json`)
   - **Output Directory**: `.next` (auto-detected)
5. Click **Deploy**.

---

### Method B: Deploy using Vercel CLI
If you have Vercel CLI installed:
```bash
cd CamperDynamics
npx vercel
```
Follow the interactive prompts to link and deploy your project. For production:
```bash
npx vercel --prod
```

---

## What Works on Vercel Out-of-the-Box

The application includes an automated hybrid preview and cloud architecture:

1. **3D Interactive Studio (`/studio`)**:
   - Real-time 3D Hilux model with Basecamp & Backpack conversions
   - Exterior 360° rotation, day/night lighting, and zoom
   - 29 interactive interior furnishings and custom finishes
   - Floor plan layout planner with boundary and overlap validation
   - Responsive UI for desktop, tablet, and mobile

2. **Portal Experience (`/`)**:
   - Scroll-driven story chapters and live vehicle cutaways
   - Guided lifestyle recommendation wizard
   - Saved builds (with revisions, undo/redo, and comparison mode)
   - PDF summaries and printable proposals
   - Consultation and test-drive booking interface
   - Non-looping woodland trail 3D game with checkpoints, driving physics, and reward badge issuance
   - Administrative portal for catalog, availability calendar, and promotions

3. **Storage & Fallback**:
   - When deployed on Vercel, client and device storage handles persistent local builds, proposals, and game runs with 0 extra infrastructure needed.
   - If connected with Cloudflare D1 / R2 server headers in the future, it seamlessly activates server-side database persistence.

---

## Optional Environment Variables

You can configure these under **Settings > Environment Variables** in your Vercel project:

| Variable | Description | Default |
| --- | --- | --- |
| `ADMIN_EMAILS` | Comma-separated allowlist of emails with admin rights | `""` |
| `NEXT_PUBLIC_DEMO_MODE` | Force device preview mode across all domains | `true` on `.vercel.app` |
