# VLSM Subnetting Tree Visualization

Enterprise Network Design Project - VLSM Subnetting Configuration Visualization

## Project Overview

This project visualizes the complete VLSM (Variable Length Subnet Masking) subnetting configuration for an enterprise network design, including:

- 13 Primary Networks (A-N)
- 29 Point-to-Point Router Links
- 15 LAN Segments
- Interactive Mermaid tree diagrams
- Statistical charts and analytics
- Project documentation and results gallery

## Deployment to Vercel

The project is configured to deploy to Vercel with the `vercel.json` configuration file. The setup automatically serves `web/index.html` as the main page while keeping all assets accessible.

### Quick Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Navigate to project root and deploy**:
   ```bash
   cd enterprise-network-design
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - Project name? (Press Enter for default or enter custom name)
   - Directory? **./** (current directory)

5. **For production deployment**:
   ```bash
   vercel --prod
   ```

### Deploy via Vercel Dashboard (GitHub Integration)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign in

3. **Click "Add New Project"**

4. **Import your GitHub repository**

5. **Configure the project**:
   - **Root Directory**: `.` (project root - **important!**)
   - **Framework Preset**: Other
   - **Build Command**: Leave empty (static site, no build needed)
   - **Output Directory**: Leave empty (we use rewrites in vercel.json)
   - **Install Command**: Leave empty

6. **Click "Deploy"**

   ⚠️ **Important**: Do NOT set Output Directory to `web` in the dashboard. The `vercel.json` file handles routing automatically.

### Verify Deployment

After deployment, your site should be accessible at:
- Preview URL: `https://your-project-name.vercel.app`
- Production URL: `https://your-project-name.vercel.app` (after `vercel --prod`)

The configuration automatically:
- Serves `web/index.html` as the homepage
- Makes all images in `results/`, `configured_topology_snapshots/`, and root directory accessible
- Handles relative paths (`../`) correctly

## Important Notes

- The `vercel.json` file is configured to serve the `web` directory as the output
- All image assets in `results/`, `configured_topology_snapshots/`, and root directory should be accessible
- The HTML file uses relative paths (`../`) to reference images, which should work correctly with the current configuration

## Project Structure

```
enterprise-network-design/
├── web/                    # Web application files
│   ├── index.html          # Main HTML file
│   ├── script.js           # JavaScript functionality
│   ├── styles.css          # Styling
│   └── vlsm-tree-complete.mmd  # Mermaid diagram source
├── results/                 # Project result images
├── configured_topology_snapshots/  # Topology images
├── vercel.json             # Vercel configuration
└── package.json            # Project metadata
```

## Local Development

To run the project locally:

```bash
# Using Python's built-in server
cd web
python -m http.server 8000

# Or using Node.js serve
npx serve web
```

Then open `http://localhost:8000` in your browser.

## Features

- ✅ Interactive VLSM tree visualization
- ✅ Network statistics and analytics
- ✅ Chart.js powered data visualization
- ✅ Mermaid diagram integration
- ✅ Responsive design
- ✅ Image gallery with modal view
- ✅ Search and filter functionality

## Author

**Muhammad Nouman Hafeez** (21I-0416)  
FAST National University | Computer Networks Project

---

For issues or questions, please refer to the project documentation.

