# Borra Vamshi Thirumal Reddy — Technical Portfolio

An **Awwwards-tier**, high-craft technical portfolio built as an **editorial survey chart**: hairline rules, plotted readouts, plotter pen micro-interactions, interactive architecture diagrams, and a signature **procedural 3D contour mountain terrain** powered by Three.js.

Designed with a **zero-build-step architecture** — pure HTML5, modern Vanilla CSS, and ES Modules loaded via import maps. No bundlers, no build pipeline, and no runtime dependencies to install. It runs directly on any static host, including GitHub Pages, Cloudflare Pages, or Vercel.

---

## ⚡ Quick Start (Run Locally)

Because the project uses browser-native **ES Modules** and **Import Maps**, modern browsers require it to be served over HTTP (opening directly via `file://` is blocked by browser CORS security policies).

### Option 1: Python (Recommended — Pre-installed on most systems)

```bash
# Navigate to the portfolio folder
cd vamshi-portfolio

# Start a local HTTP server
python -m http.server 8000
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

### Option 2: Node.js / npx

```bash
cd vamshi-portfolio
npx serve .
```

### Option 3: VS Code Live Server
Right-click `index.html` and select **"Open with Live Server"**.

> **Note:** If `index.html` is ever accidentally opened via `file://`, the page automatically catches it and renders a friendly, clear troubleshooting banner explaining how to run the local server.

---

## 📁 Repository Structure

The codebase is strictly separated by concern:

```text
vamshi-portfolio/
├── content.js        # 🌟 THE ONLY FILE YOU NEED TO EDIT TO CUSTOMIZE CONTENT
│                     # Contains all personal info, projects, skills, and links
├── index.html        # Semantic HTML5 shell, layout landmarks, and fallback plates
├── styles.css        # Design system: OKLCH tokens, editorial grid, responsive rules
├── main.js           # Behaviour & rendering layers: Three.js terrain, scroll spy, diagrams
├── assets/
│   └── favicon.svg   # Custom contour mark favicon
└── README.md         # Documentation & guide
```

| File | Role | Should you edit it? |
| :--- | :--- | :--- |
| **`content.js`** | **All text, projects, numbers, and links.** Modifying this updates the entire site without touching HTML or CSS. | **Yes — Primary file** |
| **`index.html`** | Semantic page shell and structural markup. Contains zero hardcoded personal data. | Only to add new sections |
| **`styles.css`** | The entire visual system: OKLCH palette, typographic scales, layout grids, and animations. | Only for design styling changes |
| **`main.js`** | Isolated execution layers: 3D terrain canvas, scroll spy, disclosure accordions, and SVG diagrams. | Only for engine changes |

---

## 🛠️ How to Customize Your Portfolio

All personal information lives in `content.js` under the `portfolio` object.

### 1. Update Personal Info & Links
Open `content.js` and edit the `person` block:
```javascript
person: {
  name: "Your Full Name",
  shortName: "Your First Name",
  role: "AI / ML · Data Systems · LLM Engineering",
  email: "your.email@example.com",
  phone: "+1234567890",
  phoneDisplay: "+1 (234) 567-890",
  github: "https://github.com/yourusername",
  linkedin: "https://www.linkedin.com/in/yourusername",
  leetcode: "https://leetcode.com/yourusername",
}
```

### 2. Update the About Section
Edit the `about` block to describe your engineering focus, marginalia notes, and technical specifications:
```javascript
about: {
  headline: "I build the layer between a question and the number that answers it.",
  body: [
    "First paragraph detailing your background and specialization...",
    "Second paragraph outlining your technical approach and philosophy...",
    "Third paragraph mentioning your open source or production impact..."
  ],
  marginalia: [
    { term: "Method", value: "Verify before you trust" },
    { term: "Focus", value: "LLM orchestration · data systems" }
  ],
  spec: [
    { term: "Core Focus", value: "Natural-language interfaces to databases" },
    { term: "Core Stack", value: "Python · SQL · FastAPI · Docker" }
  ]
}
```

### 3. Add or Modify Projects
Projects are configured in `work.projects`. Each project renders as title + description + Problem / System / Approach / Result + link + stack. No diagrams.

Example project entry:
```javascript
{
  id: "my-project",
  title: "Project Name",
  subtitle: "Brief subtitle describing the system",
  year: "2026",
  flagship: true,
  repo: "https://github.com/username/project",
  linkLabel: "View on GitHub",
  description: "High-level summary of the project.",
  problem: "What problem does it solve?",
  system: "What was actually built?",
  approach: "Architecture, models, infrastructure.",
  result: "Verified outcome from the project itself.",
  stack: ["Python", "FastAPI", "PostgreSQL", "Docker"]
}
```

### 4. Update the Toolkit ("The Stack")
The `toolkit.groups` array defines the disclosure accordion strata. Add, remove, or rename tools in each stratum:
* `01 Intelligence` (Models, LLM orchestration, RAG)
* `02 Data` (Warehouses, ETL, SQL, Pandas)
* `03 Systems` (FastAPI, Redis, Docker, Supabase)
* `04 Cloud & Delivery` (GCP, CI/CD, Git)
* `05 Analysis & Visualisation` (Reporting, Dashboards, BI)

---

## 🎨 Design & Craft Standards

This portfolio is built to reflect the highest standards of digital craftsmanship:
* **Distinctive Typography**: Pairing editorial serif (*Instrument Serif*) with crisp contemporary grotesque (*Instrument Sans*) and monospace (*JetBrains Mono*).
* **Harmonious OKLCH Palette**: Perceptually uniform colors configured with CSS custom properties. Rich neutral paper grounds (`#f5f2ec`) paired with deep ink tones and vibrant signal accents.
* **3D Mountain Topography**: Procedural value-noise marching squares terrain rendered in Three.js with iso-contour lines and surveyor peak markers. Shifts gracefully and fades out on mobile/reduced-motion settings.
* **Responsive Editorial Grid**: Handcrafted 12-column layout that naturally adapts from 4K ultrawide monitors down to compact smartphones without breaking typographic balance.
* **Keyboard & Screen-Reader Accessible**: Real semantic elements (`<nav>`, `<main>`, `<section>`, `<dl>`), proper `aria-expanded` attributes, accessible SVGs, and focus rings.

---

## 🚀 Deployment Guide

### Deploying to GitHub Pages (Free)

1. **Push your code to GitHub**:
   ```bash
   cd vamshi-portfolio
   git init
   git add .
   git commit -m "feat: portfolio release"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click **Settings** → **Pages** (in the left sidebar).
   - Under **Build and deployment**, set **Source** to **"Deploy from a branch"**.
   - Select the **`main`** branch and the **`/(root)`** folder.
   - Click **Save**.

Your portfolio will be live at `https://<your-username>.github.io/<your-repo-name>/` in 1–2 minutes!

### Deploying to Vercel / Netlify / Cloudflare Pages

Simply import the repository. No build command (`npm run build`) is required; set the **Output Directory** to `.` or leave it blank. It works instantly out of the box.

---

## 📜 License

Created for **Borra Vamshi Thirumal Reddy**. Free to inspect, learn from, and adapt for personal portfolio use with attribution.
